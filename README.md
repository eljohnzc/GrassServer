# getgrass-bot

This repository contains the code for `grassfarmingbot`, a bot designed to establish WebSocket connections through various HTTP and SOCKS proxies, specifically aimed at farming for Grass Airdrop Season 2.

## Overview

`grassfarmingbot` connects to a specified WebSocket server using both HTTP and SOCKS proxies. It leverages the `ws` library for WebSocket communication and integrates the `https-proxy-agent` and `socks-proxy-agent` libraries for enhanced proxy support. This allows for more versatile and resilient connections, accommodating a wider range of proxy types.

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/lester51/grassfarmingbot
   ```

2. Navigate to the project directory:

   ```bash
   cd grassfarmingbot
   ```

3. Install the required dependencies using npm && setup env

   ```bash
   npm install && cp .env.example .env
   ```

## Usage

1. Obtain your user ID from the Getgrass website:

   - Visit [https://app.getgrass.io/dashboard](https://app.getgrass.io/register/?referralCode=NXZg3yAsUsXKzy2).
   - Paste this to address bar and Enter:

     ```javascript
     javascript:alert(localStorage.getItem('userId'));
     ```

   - Copy the value, which is your user ID.

2. In .env list your user IDs in this pattern:

   ```text
   UID=['id1','id2','id3']
   ```

3. To specify proxies, create a file named `proxy.txt` in the project directory and add your desired proxy URLs, following the same new-line format, like this:

   ```text
   http://username:password@hostname:port
   socks5://username:password@hostname:port
   ```

4. To run the `getgrass-bot`, execute the following command in your terminal:

   ```bash
   npm start
   ```

## Donations

If you would like to support the development of this project, you can make a donation using the following addresses:

- **Tron(TRX)**: `0x38d6b8CA4bfd2cca11799a2eF99362f39F4087f8`
- **Solana**: `5pCf42xGn55vYzqCb2HwsnViUvpceNmH8R4GaJ8bEcWz`
- **Ton**: `0x38d6b8CA4bfd2cca11799a2eF99362f39F4087f8`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contribution

If you find this project useful, please consider giving it a star on GitHub! Your support motivates further development and enhancements.
