"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Sarah Jenkins",
    role: "Patient",
    content:
      "The scheduling system is so intuitive. I booked my cardiology appointment in less than 2 minutes without any hassle.",
    avatar: "/p1.png",
    rating: 2,
  },
  {
    name: "Dr. Michael Chen",
    role: "Specialist",
    content:
      "As a doctor, this platform helps me manage my queue efficiently. The interface is clean, professional, and very fast.",
    avatar: "/p2.png",
    rating: 5,
  },
  {
    name: "Alisa Vret",
    role: "Patient",
    content:
      "Best experience I've had with a hospital app. The video consultation was crystal clear and very secure.",
    avatar: "/p3.png",
    rating: 3,
  },
  {
    name: "James Wilson",
    role: "Patient",
    content:
      "Laboratory results were delivered to my phone within hours. Truly world-class healthcare technology.",
    avatar: "/p4.png",
    rating: 4,
  },
];

export default function ReviewSection() {
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="col-span-12 pb-10 lg:pb-20">
      <div className="mb-10 space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          What our patients say
        </h2>
        <p className="body-text opacity-80">
          Real experiences from people who trusted us with their health journey.
        </p>
      </div>

      <div
        className="relative flex overflow-hidden py-4"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90% , transparent)",
        }}
      >
        <motion.div
          className="flex gap-5 pr-5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {duplicatedReviews.map((review, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="w-[300px] md:w-[380px] shrink-0 bg-card border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/40 cursor-zoom-in group">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-4 transition-all",
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted/20 text-muted/20",
                            )}
                          />
                        ))}
                      </div>
                      <p className="body-text text-sm md:text-base leading-relaxed text-foreground/90 line-clamp-3">
                        {review.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-4 mt-4">
                      <div className="relative size-10 rounded-full overflow-hidden border border-border bg-muted">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold leading-none">
                          {review.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                          {review.role}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[450px] border-none bg-card/95 backdrop-blur-xl p-0 overflow-hidden rounded-[2rem] shadow-2xl">
                <DialogHeader className="p-8 pb-0">
                  <DialogTitle className="sr-only">
                    Review by {review.name}
                  </DialogTitle>
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </DialogHeader>

                <div className="px-8 pb-4">
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-foreground tracking-tight">
                    &quot;{review.content}&quot;
                  </p>
                </div>

                <div className="p-8 bg-primary/5 flex items-center gap-4">
                  <div className="relative size-12 rounded-full overflow-hidden border-2 border-background">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-base text-foreground leading-none">
                      {review.name}
                    </h4>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1.5">
                      {review.role}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
