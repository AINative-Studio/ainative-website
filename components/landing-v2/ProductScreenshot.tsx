import Image from 'next/image';

export default function ProductScreenshot() {
  return (
    <div className="relative z-[3] -mt-[380px]">
      <div className="flex justify-center max-w-[1440px] mx-auto">
        <Image
          src="/landing-v2/rectangle.png"
          alt="AI Native Studio IDE Preview"
          width={1440}
          height={800}
          className="w-full max-w-[1440px] max-h-[800px] object-cover object-top"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          }}
          priority
        />
      </div>
    </div>
  );
}
