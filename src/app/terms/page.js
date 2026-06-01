export default function TermsOfService() {
  return (
    <main className="flex-1 py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-[#09090b]">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-6">Terms of Service</h1>
      <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
        <p>
          Last updated: June 1, 2026
        </p>
        <p>
          Welcome to AI Group Photo. By accessing our website, you agree to comply with and be bound by the following terms and conditions of use.
        </p>
        <h2 className="text-xl font-bold text-zinc-200 mt-8">Use of the Service</h2>
        <p>
          Our service allows users to upload portraits and apply style/face-swapping technology using AI models. You retain all rights to your uploaded images. However, you grant us and our AI partners a license to process the images to provide the generation output.
        </p>
        <p>
          You agree not to upload any offensive, illegal, or infringing content. We reserves the right to terminate accounts that violate this rule.
        </p>
        <h2 className="text-xl font-bold text-zinc-200 mt-8">Credits and Purchases</h2>
        <p>
          All credit pack purchases are one-time payments handled securely via Stripe. Credits are non-refundable and are consumed per successful generation request (18 credits per generation).
        </p>
        <h2 className="text-xl font-bold text-zinc-200 mt-8">Disclaimer</h2>
        <p>
          The service is provided "as is" and "as available". We do not guarantee that the generated images will meet all expectations or be free of artifacts.
        </p>
      </div>
    </main>
  );
}
