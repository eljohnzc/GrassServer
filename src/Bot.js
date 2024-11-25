require('colors')
const WebSocket = require('ws')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const { SocksProxyAgent } = require('socks-proxy-agent')
const { HttpsProxyAgent } = require('https-proxy-agent')
const logger = require('./logger')

class Bot {
  constructor(config) {
    this.config = config
  }

  async getProxyIP(proxy) {
    const agent = proxy.startsWith('http') ? new HttpsProxyAgent(proxy) : new SocksProxyAgent(proxy)
    try {
      const response = await axios.get(this.config.ipCheckURL, {
        httpsAgent: agent,
      })
      logger.info(`Connected through proxy ${proxy}`)
      return response.data
    } catch (error) {
      logger.error(`Skipping proxy ${proxy} due to connection error: ${error.message}`)
    }
    return null
  }

  async connectToProxy(proxy, userID) {
    const formattedProxy = proxy.startsWith('socks5://')
      ? proxy
      : proxy.startsWith('http')
        ? proxy
        : !proxy.includes('://')
          ? `socks5://${proxy}`
          : proxy
    const proxyInfo = await this.getProxyIP(formattedProxy)

    if (!proxyInfo) return
    
    try {
      const agent = formattedProxy.startsWith('http')
        ? new HttpsProxyAgent(formattedProxy)
        : new SocksProxyAgent(formattedProxy)
      const wsURL = `wss://${this.config.wssHost}`
      const ws = new WebSocket(wsURL, {
        agent,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
          Pragma: 'no-cache',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          OS: 'Windows',
          Platform: 'Desktop',
          Browser: 'Mozilla',
        },
      })

      ws.on('open', () => {
       logger.info(`Connected to ${proxy}`)
     logger.info(`Proxy IP Info: ${JSON.stringify(proxyInfo)}`)
        this.sendPing(ws, proxyInfo.ip)
      })

      ws.on('message', (message) => {
        const msg = JSON.parse(message)
       logger.info(`Received message: ${JSON.stringify(msg)}`)

        if (msg.action === 'AUTH') {
          const authResponse = {
            id: msg.id,
            origin_action: 'AUTH',
            result: {
              browser_id: uuidv4(),
              user_id: userID,
              user_agent: 'Mozilla/5.0',
              timestamp: Math.floor(Date.now() / 1000),
              device_type: 'desktop',
              version: '4.28.1',
            },
          }
          ws.send(JSON.stringify(authResponse))
         logger.info(`Sent auth response: ${JSON.stringify(authResponse)}`)
        } else if (msg.action === 'PONG') {
          logger.info(`Received PONG: ${JSON.stringify(msg)}`)
        }
      })

      ws.on('close', (code, reason) => {
        logger.info(`WebSocket closed with code: ${code}, reason: ${reason}`)
        setTimeout(() => this.connectToProxy(proxy, userID), this.config.retryInterval)
      })

      ws.on('error', (error) => {
       logger.error(`WebSocket error on proxy ${proxy}: ${error.message}`)
        ws.terminate()
      })
    } catch (error) {
    logger.error(`Failed to connect with proxy ${proxy}: ${error.message}`)
    }
  }

  async connectDirectly(userID) {
    try {
      const wsURL = `wss://${this.config.wssHost}`
      const ws = new WebSocket(wsURL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
          Pragma: 'no-cache',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          OS: 'Windows',
          Platform: 'Desktop',
          Browser: 'Mozilla',
        },
      })

      ws.on('open', () => {
       logger.info(`Connected directly without proxy`)
        this.sendPing(ws, 'Direct IP')
      })

      ws.on('message', (message) => {
        const msg = JSON.parse(message)
       logger.info(`Received message: ${JSON.stringify(msg)}`)

        if (msg.action === 'AUTH') {
          const authResponse = {
            id: msg.id,
            origin_action: 'AUTH',
            result: {
              browser_id: uuidv4(),
              user_id: userID,
              user_agent: 'Mozilla/5.0',
              timestamp: Math.floor(Date.now() / 1000),
              device_type: 'desktop',
              version: '4.28.1',
            },
          }
          ws.send(JSON.stringify(authResponse))
          logger.info(`Sent auth response: ${JSON.stringify(authResponse)}`)
        } else if (msg.action === 'PONG') {
         logger.info(`Received PONG: ${JSON.stringify(msg)}`)
        }
      })

      ws.on('close', (code, reason) => {
       logger.info(`WebSocket closed with code: ${code}, reason: ${reason}`)
        setTimeout(() => this.connectDirectly(userID), this.config.retryInterval)
      })

      ws.on('error', (error) => {
        logger.error(`WebSocket error: ${error.message}`)
        ws.terminate()
      })
    } catch (error) {
      logger.error(`Failed to connect directly: ${error.message}`)
    }
  }

  sendPing(ws, proxyIP) {
    setInterval(() => {
      const pingMessage = {
        id: uuidv4(),
        version: '1.0.0',
        action: 'PING',
        data: {},
      }
      ws.send(JSON.stringify(pingMessage))
      logger.info(`Sent ping - IP: ${proxyIP}, Message: ${JSON.stringify(pingMessage)}`)
    }, 26000)
  }
}

module.exports = Bot
