export const skills = {
  hardware: ["NVIDIA Jetson", "Arduino", "ESP32", "Quanser"],
  domains: ["AI & ML", "IoT-based Projects", "ADAS", "Embedded Systems"],
  tools: ["TensorFlow", "OpenCV", "VS Code", "Android Studio", "Anaconda"],
  professional: ["Leadership", "Critical Thinking", "Effective Communication", "Problem Solving"]
};

export type Project = {
  id: string;
  title: string;
  year: string;
  collaborator?: string;
  description: string[];
  image: string;
  category: string;
};

export const projects: Project[] = [
  {
    id: "p1",
    title: "GMSL Link Quality Analyzer",
    year: "2025",
    collaborator: "NVIDIA Collaborative Project",
    category: "Embedded & Multimedia",
    description: [
      "Designed and implemented a real-time GMSL Link Quality Analyzer using NVIDIA Jetson and ARDUCAM camera.",
      "Developed algorithms leveraging mean, standard deviation, and checksum to detect corrupted, frozen, or noisy frames.",
      "Built a scalable diagnostic tool for multimedia link integrity in automotive and embedded systems."
    ],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: "p2",
    title: "Monocular Video-Based Road Scene 2D Mapping",
    year: "2025",
    collaborator: "Senior Design Project",
    category: "Computer Vision & ADAS",
    description: [
      "Built a monocular vision system for road segmentation, object detection, and distance estimation using deep learning and classical CV techniques.",
      "Generated a 2D top-view environment map through homography-based perspective transformation and temporal smoothing.",
      "Improved efficiency using pre-trained models and optimized inference strategies."
    ],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: "p3",
    title: "Machine Learning Powered Malpractice Detection",
    year: "2024",
    category: "AI & Surveillance",
    description: [
      "Designed and implemented an AI-driven malpractice detection system using YOLOv8 and RetinaNet for exam surveillance.",
      "Trained models on a 4,000+ image dataset with 12 behavioral classes, achieving high precision and recall across controlled and dynamic environments.",
      "Conducted comparative analysis of YOLOv8 vs RetinaNet, demonstrating trade-offs between speed and robustness for real-world deployment."
    ],
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: "p4",
    title: "Industrial Defect Detection & Segmentation",
    year: "2025",
    category: "Deep Learning & Quality Control",
    description: [
      "Designed an unsupervised defect detection pipeline using PatchCore on the MVTec Anomaly Detection dataset (Bottle category), trained solely on defect-free samples.",
      "Achieved strong performance with Image-level AUROC ≈ 1.00 and Pixel-level AUROC ≈ 0.98, enabling reliable detection and localization of manufacturing defects.",
      "Built an end-to-end inspection system with a Streamlit UI, providing anomaly heatmaps, overlay visualization, and automated pass/fail quality decisions."
    ],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
  }
];
