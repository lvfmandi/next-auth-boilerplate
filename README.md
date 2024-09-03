<div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 16px; text-align: center; margin: 0 auto; width: fit-content;">
    <img src="./public/next.svg" width="130" alt="Logo for Next JS">
    <img src="https://neon.tech/_next/static/svgs/6da928883916f39a4848774319dcaf81.svg" width="100" alt="Logo for Neon">
    <img src="https://raw.githubusercontent.com/prisma/presskit/main/Assets/Prisma-IndigoLogo.svg" width="100" alt="Logo for Prisma">
    <img src="./public/ts-logo.svg" width="60" alt="Logo for Typescript">
    <span style="font-weight: 600;">shadcn/ui</span>
    <span style="font-weight: 300;">ArcticJS</span>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://resend.com/static/brand/resend-icon-white.png">
        <img src="https://resend.com/static/brand/resend-icon-black.png" width="60" alt="Logo for resend"/>
    </picture>
    <img src="https://www.twilio.com/content/dam/twilio-com/global/en/blog/legacy/2010/twilio-logo-in-the-snow-html/twilio-mark-red.png" width="60" alt="logo for twilio"/>
</div>
<hr />
<h1 style="font-weight: 300" align="center">
  NextJS Authentication with: Neon, Postgress, Typescript, ArcicJS, Resend, Twilio and Shadcn Components
</h1>

![Next JS Authentication Image](./public//app-image.png)

## Getting Started

### Environment Variables
To get started, you need to create a .env file in the root of the project. Add all the environment variables: <br>
Below are the environment variables and where you can get them

```env
DOMAIN="http://localhost:3000"
```

Get a `DATABASE_URL` by following the following instructions: [Neon Database URL](https://neon.tech/docs/connect/connect-from-any-app).
```env
DATABASE_URL=
```

Generate a `JWT_SECRET` in linux or MAC by typing the following in your terminal `openssl rand -base64 32`. 

Alternatively, you can get one online in the following site: [Generate random string for a JWT Secret](https://codebeautify.org/generate-random-string)

```env
JWT_SECRET=
```

Create a `RESEND_API_KEY` by following this link: [Create Resend API key](https://resend.com/api-keys)
```env
RESEND_API_KEY=
```

Get a google `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET` by following the following instructions: [Get google client id and secret](https://www.balbooa.com/help/gridbox-documentation/integrations/other/google-client-id)
```env
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
```
Get the facebook `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` by following the following instructions: [Get facebook app id and app secret](https://theonetechnologies.com/blog/post/how-to-get-facebook-application-id-and-secret-key)

```env
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

Get the twilio `TWILIO_ACCOUNT_SID` and `TWILIO_AUTHENTICATION_TOKEN` by following these instructions: [Get twilio account side and authentication token](https://help.twilio.com/articles/14726256820123)
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTHENTICATION_TOKEN=
```
 [Follow these instructions](https://help.twilio.com/articles/360033309133) to create a `TWILIO_2FA_SERVICE_ID` for the Verify API.
```env
TWILIO_2FA_SERVICE_ID=
```

At the end of it all your `.env` file should look like this
```env
DOMAIN="http://localhost:3000"
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_secret
FACEBOOK_APP_ID=your_facebook_api_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTHENTICATION_TOKEN=your_twilio_autentication_token
TWILIO_2FA_SERVICE_ID=your_twilio_service_id_for_the_verify_service
```

### Installation of dependencies
```bash
#based on your package manager
npm install
#or
yarn install
#or
pnpm install
#or
bun install
```

### Running the project
```bash
#based on your package manager
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## The flow