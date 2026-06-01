export default function PrivacyPolicy() {
  return (
    <main className="flex-1 py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-[#09090b]">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
        <p>
          Last updated: June 1, 2026
        </p>
        <p>
          At AI Group Photo, accessible from ai-group-photo-mocha.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by AI Group Photo and how we use it.
        </p>
        <h2 className="text-xl font-bold text-zinc-200 mt-8">Information We Collect</h2>
        <p>
          We collect your email, profile name, and profile picture when you sign in using Google OAuth. This information is used strictly to set up your account, track credits, and associate creations.
        </p>
        <p>
          When you upload an image for face swapping, the image is sent to our AI API provider (MuAPI) to process the request. We do not store your raw uploaded images on our servers after the processing is complete.
        </p>
        <h2 className="text-xl font-bold text-zinc-200 mt-8">How We Use Your Information</h2>
        <p>
          We use the information we collect in various ways, including to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Process payments and manage user credits via Stripe</li>
          <li>Send transactional emails related to purchases and accounts</li>
        </ul>
        <h2 className="text-xl font-bold text-zinc-200 mt-8">Third-Party Privacy Policies</h2>
        <p>
          AI Group Photo's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party servers for more detailed information, such as Stripe and Google.
        </p>
      </div>
    </main>
  );
}
