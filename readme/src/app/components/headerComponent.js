import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <div className="flex justify-between items-center mt-4 px-4">
      <p className="font-bold text-4xl text-center w-full">Readme Automatic Generator</p>
      <Link href="https://github.com/0ettam02" className="absolute right-4">
        <Image
          src="/github.svg"
          width={40}
          height={40}
          alt="GitHub icon"
        />
      </Link>
    </div>
  );
}
