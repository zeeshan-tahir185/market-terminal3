import { motion } from "framer-motion";

export default function AnimatedPage({ children }) {
  const animations = {
    initial: { x: "100%" }, // right se start
    animate: { x: 0 },      // slide in
    exit: { x: "100%" },    // slide out
  };

  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-[7px] shadow-lg z-50"
    >
      {children}
    </motion.div>
  );
}
