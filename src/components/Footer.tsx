import Image from "next/image";

export default function Footer() {
  return (
    <div className="flex justify-center">
      <Image
        src="/icon-garden-dig.svg"
        alt="Garden Digging"
        width={120}
        height={120}
      />
    </div>
  );
}