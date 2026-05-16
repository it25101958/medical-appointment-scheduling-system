"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

interface BentoItem {
  icon: LucideIcon;
  title: string;
  action?: (() => void) | null;
  buttonText: string;
}

interface DashboardShellProps {
  badgeText: string;
  title: React.ReactNode;
  description: string;
  primaryButton: { text: string; onClick: () => void };
  secondaryButton: { text: string; onClick: () => void };
  bentoItems: BentoItem[];
}

const Bento: React.FC<BentoItem> = ({
  icon: Icon,
  title,
  action,
  buttonText,
}) => {
  return (
    <div className="bento">
      <Icon className="text-gray-500 h-6 w-6" />
      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <Button
        variant="outline"
        className="bentoText"
        onClick={action || undefined}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default function DashboardShell({
  badgeText,
  title,
  description,
  primaryButton,
  secondaryButton,
  bentoItems,
}: DashboardShellProps) {
  return (
    <section className="col-span-12 grid grid-cols-1 lg:grid-cols-12 lg:pt-20 lg:pb-20 items-center py-3">
      <div className="lg:col-span-5 z-10 xs:order-1 xs:pb-10">
        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 1.5 }}
        >
          <Badge variant="secondary" className="font-medium">
            {badgeText}
          </Badge>
          <h2 className="main-title mb-3">{title}</h2>
        </motion.div>

        <motion.p
          className="body-text"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 2 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 2.5 }}
        >
          <Button onClick={primaryButton.onClick}>{primaryButton.text}</Button>
          <Button variant={"secondary"} onClick={secondaryButton.onClick}>
            {secondaryButton.text}
          </Button>
        </motion.div>
      </div>

      <div className="lg:col-span-7 lg:col-start-7 relative order-1 lg:order-2">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 1.5 }}
        >
          {bentoItems.map((item, index) => (
            <Bento key={index} {...item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
