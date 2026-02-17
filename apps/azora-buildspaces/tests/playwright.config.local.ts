import config from './playwright.config'

// Clone the existing config but remove webServer so Playwright won't try to start it
const localConfig = {
  ...config,
  webServer: undefined,
}

export default localConfig
