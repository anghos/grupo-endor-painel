<template>
  <div class="login-container">
    <div class="login-brand">
      <div class="brand-inner">
        <img src="@/assets/logo-full-dark.png" alt="Grupo Endor" class="brand-logo"/>
        <h2>{{ T('AccessRemote') }}</h2>
        <p>{{ T('LoginTitle') }}</p>
      </div>
      <img src="@/assets/logo.png" alt="" class="brand-star" aria-hidden="true"/>
    </div>
    <div class="login-card">
      <img src="@/assets/logo.png" alt="logo" class="login-logo"/>
      <h1>{{ T('Login') }}</h1>
      <p class="login-sub">{{ T('LoginSubtitle') }}</p>

      <el-form v-if="!disablePwd" label-position="top" class="login-form">
        <el-form-item :label="T('Username')">
          <el-input v-model="form.username" type="username" class="login-input"></el-input>
        </el-form-item>

        <el-form-item :label="T('Password')">
          <el-input v-model="form.password" type="password" @keyup.enter.native="login" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <el-form-item :label="T('Captcha')" v-if="captchaCode">
          <el-input v-model="form.captcha" @keyup.enter.native="login"  class="login-input captcha-input">
            <template #append>
              <img :src="captchaCode.b64" @click="loadCaptcha" class="captcha" alt="captcha"/>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="login" type="primary" class="login-button">{{ T('Login') }}</el-button>
          <el-button v-if="allowRegister" @click="register" class="login-button">{{ T('Register') }}</el-button>
        </el-form-item>
      </el-form>

      <div class="divider" v-if="options.length > 0 && !disablePwd">
        <span>{{ T('or login in with') }}</span>
      </div>

      <div class="oidc-options">
        <div v-for="(option, index) in options" :key="index" class="oidc-option">
          <el-button @click="handleOIDCLogin(option.name)" class="oidc-btn">
            <img :src="getProviderImage(option.name)" alt="provider" class="oidc-icon"/>
            <span>{{ T(option.name) }}</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, onMounted, ref } from 'vue'
  import { useUserStore } from '@/store/user'
  import { ElMessage } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { loginOptions, captcha } from '@/api/login'
  import { getCode, removeCode } from '@/utils/auth'

  const oauthInfo = ref({})
  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
  const options = reactive([]) // 存储 OIDC 登录选项

  let platform = window.navigator.platform
  if (navigator.platform.indexOf('Mac') === 0) {
    platform = 'mac'
  } else if (navigator.platform.indexOf('Win') === 0) {
    platform = 'windows'
  } else if (navigator.platform.indexOf('Linux armv') === 0) {
    platform = 'android'
  } else if (navigator.platform.indexOf('Linux') === 0) {
    platform = 'linux'
  }
  const userAgent = navigator.userAgent
  let browser = 'Unknown Browser'
  if (/chrome|crios/i.test(userAgent)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox'
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari'
  else if (/edg/i.test(userAgent)) browser = 'Edge'

  const form = reactive({
    username: '',
    password: '',
    platform: platform,
    captcha: '',
    captcha_id: ''
  })

  const captchaCode = ref('')
  const redirect = route.query?.redirect
  const login = async () => {
    const res = await userStore.login(form).catch(e => e)
    if (!res.code) {
      ElMessage.success(T('LoginSuccess'))
      router.push({ path: redirect || '/', replace: true })
      return
    }
    if (res.code === 110) {
      // need captcha
      loadCaptcha()
    }
  }

  const loadCaptcha = async () => {
    const captchaRes = await captcha().catch(_ => false)
    console.log(captchaRes)
    captchaCode.value = captchaRes.data.captcha
    form.captcha_id = captchaRes.data.captcha.id
  }

  const handleOIDCLogin = (provider) => {
    userStore.oidc(provider, platform, browser)
  }

  import googleImage from '@/assets/google.png'
  import githubImage from '@/assets/github.png'
  import oidcImage from '@/assets/oidc.png'
  import webauthImage from '@/assets/webauth.png'
  import defaultImage from '@/assets/oidc.png'

  const providerImageMap = {
    google: googleImage,
    github: githubImage,
    oidc: oidcImage,
    // WebAuth: webauthImage,
    default: defaultImage,
  }

  const getProviderImage = (provider) => {
    return providerImageMap[provider.toLowerCase()] || providerImageMap.default
  }

  const allowRegister = ref(false)
  const disablePwd = ref(false)
  const loadLoginOptions = async () => {
    try {
      const res = await loginOptions().catch(_ => false)
      if (!res || !res.data) return console.error('No valid response received')
      res.data.ops.map(option => (options.push({ name: option }))) // 创建新的对象数组
      if (res.data.auto_oidc) {
        // 如果有自动OIDC登录选项，直接调用第一个
        handleOIDCLogin(res.data.ops[0])
      }
      disablePwd.value = res.data.disable_pwd
      allowRegister.value = res.data.register
      if (res.data.need_captcha) {
        loadCaptcha()
      }
    } catch (error) {
      console.error('Error loading login options:', error.message)
    }
  }

  onMounted(async () => {
    const code = getCode()
    if (code) {
      // 如果code存在，进行query获取user info
      const res = await userStore.query(code)
      if (res) {
        // 删除code，确保跳转之前对code进行清楚
        removeCode()
        ElMessage.success(T('LoginSuccess'))
        router.push({ path: redirect || '/', replace: true })
      }
    } else {
      // 如果code不存在, 现实登陆页面
      loadLoginOptions() // 组件挂载后调用登录选项加载函数
    }
  })

  const register = () => {
    router.push('/register')
  }
</script>

<style scoped lang="scss">
.login-container {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(380px, 1fr);
  min-height: 100vh;
  background: var(--ge-bg);
}

.login-brand {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #fff;
  background:
    radial-gradient(circle at 20% 15%, rgba(79, 155, 216, 0.35), transparent 45%),
    linear-gradient(145deg, #0f2d44 0%, #1a4a6b 55%, #12364f 100%);

  .brand-inner {
    position: relative;
    z-index: 1;
    max-width: 420px;
    text-align: center;
  }

  .brand-logo {
    width: 240px;
    max-width: 70%;
    margin-bottom: 28px;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    font-size: 15px;
    opacity: 0.75;
  }

  .brand-star {
    position: absolute;
    right: -120px;
    bottom: -120px;
    width: 460px;
    opacity: 0.07;
    filter: brightness(0) invert(1);
  }
}

.login-card {
  align-self: center;
  justify-self: center;
  width: 100%;
  max-width: 380px;
  padding: 40px 32px;
  box-sizing: border-box;

  h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: var(--ge-text);
    letter-spacing: -0.02em;
  }

  .login-sub {
    margin: 6px 0 28px;
    color: var(--ge-text-2);
    font-size: 14px;
  }
}

.login-logo {
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  display: none;
}

.login-form {
  margin-bottom: 12px;

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--ge-text-2);
  }

  :deep(.el-input__wrapper) {
    min-height: 42px;
  }
}

.login-input {
  width: 100%;

  .captcha {
    cursor: pointer;
    width: 150px;
  }
}

.captcha-input {
  :deep(.el-input-group__append) {
    padding: 0;
    overflow: hidden;
  }
}

.login-button {
  width: 100%;
  height: 44px;
  margin: 8px 0 0 !important;
  font-size: 15px;
  font-weight: 600;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  font-size: 13px;
  color: var(--ge-text-3);

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--ge-border);
  }

  &::before { margin-right: 10px; }
  &::after { margin-left: 10px; }
}

.oidc-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.oidc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 46px;
  font-size: 14px;
}

.oidc-icon {
  width: 22px;
  height: 22px;
}

@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-brand {
    display: none;
  }

  .login-logo {
    display: block;
  }
}
</style>
