/* eslint-disable */
var config = require('../../config')

module.exports = {
  src_folders: ['test/e2e/specs'], // 测试用例存放目录
  output_folder: 'test/e2e/reports', // 测试报告存放目录
  // custom_assertions_path: ['test/e2e/custom-assertions'], // 自定义断言方法存放地址  

  selenium: {
    start_process: true,
    server_path: require('selenium-server').path, // selenium服务的地址 
    host: '127.0.0.1',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': require('chromedriver').path // webDriver的地址，可以添加多个，这里只用了chrome的
    }
  },

  test_settings: {
    default: {
      selenium_port: 4444,
      selenium_host: 'localhost',
      silent: true,
      globals: {
        devServerURL: 'http://localhost:' + (process.env.PORT || config.dev.port)
      },
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        javascriptEnabled: true,
        acceptSslCerts: true,
      },
    }
  }
}