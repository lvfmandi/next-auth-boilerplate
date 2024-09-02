export const 
TwoFactorEmail = ({ code }: { code: string }) => {
  return (
    <div>
      <h1>Two Factor Code</h1>
      <p>Hi there,</p>
      <p>Use this code for your verification</p>
      <h1>{code}</h1>
      <p>If you did not try to authenticate using your account, ignore this message</p>
    </div>
  );
};
