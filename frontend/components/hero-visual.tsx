"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const INITIAL_IMAGES = [
  { id: "img-1", src: "/h1.png" },
  { id: "img-2", src: "/h2.png" },
  { id: "img-3", src: "/h3.png" },
];

export default function HeroVisual() {
  const [items, setItems] = useState(INITIAL_IMAGES);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const newArr = [...prev];
        const first = newArr.shift();
        if (first) newArr.push(first);
        return newArr;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid h-full items-center xs:gap-4 md:gap-5 grid-cols-[1fr_2fr_1fr] relative">
      {items.map((img, i) => {
        const isCenter = i === 1;

        return (
          <motion.div
            key={img.id}
            layout
            transition={{
              layout: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            }}
            className={cn(
              "relative overflow-hidden  border border-border/50",
              isCenter
                ? "xs:h-[60%] sm:h-[70%] md:h-[75%] z-20"
                : "xs:h-[40%] sm:h-[45%] md:h-[50%] z-10",
              "rounded-[24px] md:rounded-[40px]",
            )}
          >
            <Image
              src={img.src}
              alt="Healthcare"
              fill
              priority
              sizes="(max-width: 768px) 50vw, 40vw"
              className="object-cover scale-110"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
