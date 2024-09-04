<div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 16px; text-align: center; margin: 0 auto; width: fit-content;">
<picture>
        <source media="(prefers-color-scheme: dark)" srcset="./public/next-light.svg">
        <img src="./public/next.svg" width="130" alt="Logo for Next JS">
    </picture>
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
<span style="border-bottom: 1px solid"></span>
<h1 style="font-weight: 300" align="center">
  NextJS Authentication boilerplate with: Neon, Postgress, Typescript, ArcicJS, Resend, Twilio and Shadcn Components
</h1>

![Next JS Authentication Image](./public//app-image.png)

## Getting Started

### Environment Variables
To get started, you need to create a `.env` file in the root of the project. Add all the environment variables: <br>
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

## The Flow
### Sign Up flow - `/actions/signup.ts`
The sign up flow, works as follows:

1. Once the user submits the data, we validate it: We use [zod](https://www.zod.dev) for validation.

```typescript
const isValid = SignUpSchema.safeParse(data);

// return error if not valid
if (!isValid.success) return { error: 'The data provided is invalid!' };
```

2. If the data doesn't have a code we add them to our DB and then we send them a code and return them to the sign up page for them to add the code to the form.

* Check if the user we are trying to add is in our DB

```typescript
// check if the user already exists
  const exisitingUser = await getUserByEmailOrTelephone({ email, telephone });
  if (exisitingUser) {
    if (email) return { error: 'Email already in use!' };
    if (telephone) return { error: 'Phone number already in use!' };
  }
```

* We add them to the DB

```typescript
try {
    // insert data to db
    const fullName = `${firstName} ${lastName}`;
    const hash = bcrypt.hashSync(password, 12);

    await db.user.create({
      data: { fullName, email, telephone, password: hash },
    });
  } catch (error) {
    return {
      error: 'An error occured on our side, please try signing up again',
    };
  }
```
* We send them the code
```typescript
    if (telephone) {
      //  send them a code if they used their phone
      //  send them to the sign up page with the data they had given us
    }

    if (email) {
      // send them a code if they used their email
      //  send them to the sign up page with the data they had given us
    }
```

3. We check if the data includes a code for verifying their contact (**phone** or **email**) and if so we verify their contact before proceeding.
   
```typescript
  if (code) {
    if (telephone) {
      // verify the phone number code if they used their phone for verification
    }

    if (email) {
      // verify the email code if they used their email for verification
    }
  }
```

### Login flow - `/actions/login.ts`
The login flow works as follows:

1. Once the user submits the data, we validate it using [zod](https://www.zod.dev).

```typescript
  const isValid = LogInSchema.safeParse(data);

  if (!isValid.success) return { error: 'The data provided in invalid!' };
```

2. We look up the user, and if we do not have a user, we return an error
```typescript
  // look up the user
  const existingUser = await getUserByEmailOrTelephone({ email, telephone });

  // return error if we have no user in the DB
  if (!existingUser)
    return { error: 'Invalid username or password, try again!' };
```

1. We check if the user has been verified, if not we verify them. Here we repeat the process we went through in the sign up server action just in case they skipped the verification part.
   
2. We go through a similar process of verification but now, only if the user has 2FA enabled in their settings.
```typescript
    // check if the user has 2FA enabled
  if (existingUser.isTwoFactorEnabled) {
    // check if they have given us the code, so that we can verify it
    // if they do not have a code, send it to them so that we can verify them 
  }
```
1. Compare if passwords match
```typescript
// compare if passwords match
  const passwordsMatch = bcrypt.compareSync(
    password,
    existingUser.password || '',
  );

  // return error if passwords don't match
  if (!passwordsMatch) return { error: 'Invalid email or password' };
```

6. Create a session once the user is authenticated
```typescript
  // add the tokens to the HTTP-only cookie
  await createSession({
    userId: existingUser.id,
    userRole: existingUser.role,
    _v: existingUser.refreshTokenVersion,
  });
```

7. We return the user we just created to the frontend so that they can be persisted in the state


### Forgot password flow - `/actions/forgot-password.ts`
1. Check if we have a code, and verify it
```typescript
if(code) {
  // verify that code using the contact information provided by the user in step 2 or 3
}
```
2. Check if we are using a phone number
```typescript
if(telephone) {
  // verify that code using the phone number provided by the user
}
```  
1. Check if we are using an email
```typescript
if(email) {
  // verify that code using the email provided by the user
}
```
3. If we don't have a code, send them a verification code
```typescript
else {
  // verify that code using the contact provided by the user
  // (email) or (telephone)
}
```

### Settings page flow
1. Get the current user by checking the session
2. Validate the data
3. Remove the email and password of a user if they are an oAuth user
4. Pass some data validation checks
5. If we have a code, we can validate a new user
6. If we don't have a code, we can send the user a code so that they can resend it with a request
7. Changing roles
8. Updating a user

### 