import Logo from "@/components/icons/Logo";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from "@/utils/auth-helpers/settings";
import Card from "@/components/ui/Card";
import PasswordSignIn from "@/components/ui/AuthForms/PasswordSignIn";
import EmailSignIn from "@/components/ui/AuthForms/EmailSignIn";
import Separator from "@/components/ui/AuthForms/Separator";
import OauthSignIn from "@/components/ui/AuthForms/OauthSignIn";
import ForgotPassword from "@/components/ui/AuthForms/ForgotPassword";
import UpdatePassword from "@/components/ui/AuthForms/UpdatePassword";
import SignUp from "@/components/ui/AuthForms/Signup";

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id?: string };
  searchParams: { disable_button?: boolean };
}) {
  const viewTypes = getViewTypes();
  const { allowEmail, allowPassword, allowOauth } = getAuthTypes();
  const redirectMethod = getRedirectMethod();

  let viewProp: string;

  if (typeof params?.id === "string" && viewTypes.includes(params.id)) {
    viewProp = params.id;
  } else {
    const cookieStore = await cookies();
    const preferredSignInView =
      cookieStore.get("preferredSignInView")?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && viewProp !== "update_password") {
    return redirect("/");
  } else if (!user && viewProp === "update_password") {
    return redirect("/signin");
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <div className="flex justify-center pb-12 ">
          <Logo width="64px" height="64px" />
        </div>
        <Card
          title={
            viewProp === "forgot_password"
              ? "Reset Password"
              : viewProp === "update_password"
                ? "Update Password"
                : viewProp === "signup"
                  ? "Sign Up"
                  : "Sign In"
          }
        >
          {viewProp === "password_signin" && (
            <PasswordSignIn
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
            />
          )}
          {viewProp === "email_signin" && (
            <EmailSignIn
              allowPassword={allowPassword}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}
          {viewProp === "forgot_password" && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}
          {viewProp === "update_password" && (
            <UpdatePassword redirectMethod={redirectMethod} />
          )}
          {viewProp === "signup" && (
            <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
          )}
          {viewProp !== "update_password" &&
            viewProp !== "signup" &&
            allowOauth && (
              <>
                <Separator text="Third-party sign-in" />
                <OauthSignIn />
              </>
            )}
        </Card>
      </div>
    </div>
  );
}
