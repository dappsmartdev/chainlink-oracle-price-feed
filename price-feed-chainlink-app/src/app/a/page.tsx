"use client";

import Image from "next/image";
import * as React from "react";
import { useReadContract, useAccount, useChainId } from "wagmi";

export default function Home() {
 
  return (
   <>
    <Image
       alt="he"
      width={500}
      height={500}
      src={'/images/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063/logo.png'}
    />
   
   </>
  );
}