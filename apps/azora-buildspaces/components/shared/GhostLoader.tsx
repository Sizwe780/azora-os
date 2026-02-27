import { motion } from 'framer-motion'

interface GhostLoaderProps {
  variant: 'code' | 'message'
}

// simple motion variants for staggered lines
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const child = {
  hidden: { opacity: 0, y: -2 },
  visible: { opacity: 1, y: 0 },
}

export default function GhostLoader({ variant }: GhostLoaderProps) {
  if (variant === 'message') {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {["w-3/4", "w-5/6", "w-2/3"].map((w, i) => (
          <motion.div
            key={i}
            variants={child}
            className={`${w} h-3 bg-zinc-700 rounded`}
          />
        ))}
      </motion.div>
    )
  }

  // code skeleton: mimic a function with indentation
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-1 font-mono text-xs"
    >
      <motion.div variants={child} className="h-3 bg-zinc-700 rounded w-5/6" />
      <motion.div variants={child} className="h-3 bg-zinc-700 rounded w-full ml-4" />
      <motion.div variants={child} className="h-3 bg-zinc-700 rounded w-11/12 ml-4" />
      <motion.div variants={child} className="h-3 bg-zinc-700 rounded w-3/4 ml-8" />
    </motion.div>
  )
}
