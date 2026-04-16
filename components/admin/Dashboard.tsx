"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  User,
  ClipboardList,
  FileText,
  FilePlus,
  Users,
  Bed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

interface BentoProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  action?: (() => void) | null;
  buttonText: string;
}

const Bento: React.FC<BentoProps> = ({
  icon: Icon,
  title,
  action,
  buttonText,
}) => {
  const handleClick = action ? action : undefined;
  return (
    <div className="bento">
      <Icon className="text-gray-500 h-6 w-6" />
      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <Button variant="outline" className="bentoText" onClick={handleClick}>
        {buttonText}
      </Button>
    </div>
  );
};

export default function Portal() {
  const router = useRouter();

  const handleManageUsers = () => {
    router.push("/admin/manage-users");
  };

  const handleViewAppointments = () => {
    router.push("/admin/appointments/today");
  };

  const handleManageBilling = () => {
    router.push("/admin/billing");
  };

  const handleManageLaboratory = () => {
    router.push("/admin/laboratory");
  };

  const bentoItems = [
    {
      icon: FileText,
      title: "Billings",
      action: handleManageBilling,
      buttonText: "Manage Billing",
    },
    {
      icon: ClipboardList,
      title: "Laboratory",
      action: handleManageLaboratory,
      buttonText: "Manage Laboratory",
    },
    {
      icon: FilePlus,
      title: "Prescriptions",
      action: null,
      buttonText: "Manage Prescriptions",
    },
    {
      icon: Users,
      title: "Patients",
      action: null,
      buttonText: "View Patients",
    },
    {
      icon: Bed,
      title: "Rooms",
      action: null,
      buttonText: "Manage Rooms",
    },
  ];

  return (
    <section className="col-span-12 grid grid-cols-1 lg:grid-cols-12 lg:pt-20  lg:pb-20 items-center py-3">
      <div className="lg:col-span-5 z-10 xs:order-1 xs:pb-10">
        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 1.5 }}
        >
          <Badge variant="secondary" className="font-medium">
            Welcome Back
          </Badge>
          <h2 className="main-title mb-3">
            Your Dashboard <br />
            <span>Manage All Appointments & Information</span>
          </h2>
        </motion.div>

        <motion.p
          className="body-text"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 2 }}
        >
          View today's appointments, manage users, and handle admin tasks all
          from this dashboard.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 2.5 }}
        >
          <Button onClick={handleManageUsers}>Manage Users</Button>
          <Button variant={"secondary"} onClick={handleViewAppointments}>
            Appointments
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
            <Bento
              key={index}
              icon={item.icon}
              title={item.title}
              action={item.action}
              buttonText={item.buttonText}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
