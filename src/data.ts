export const skills = {
  cv_dl: [
    'PyTorch', 'TensorFlow', 'OpenCV', 'Scikit-learn',
    'NumPy', 'Pandas', 'HuggingFace Transformers',
    'CNNs', 'Vision Transformers', 'GANs',
  ],
  platforms: [
    'Python', 'NVIDIA Jetson', 'Git & GitHub',
    'Streamlit', 'VS Code', 'Anaconda',
    'LabelImg', 'REST APIs', 'FAISS',
  ],
  domains: [
    'Object Detection', 'Image Segmentation',
    'Anomaly Detection', 'Video Analytics',
    'Edge AI', 'Embedded Systems', 'ADAS',
    'Agentic AI', 'LLM Orchestration', 'RAG Pipelines',
  ],
  professional: [
    'Analytical Thinking', 'Attention to Detail',
    'Technical Documentation', 'Team Collaboration',
    'Problem Solving',
  ],
};

export type Project = {
  id: string;
  title: string;
  year: string;
  collaborator?: string;
  description: string[];
  tech: string[];
  image: string;
  category: string;
  highlight?: string;   // key metric shown on card
};

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'GMSL Link Quality Analyzer',
    year: '2025',
    collaborator: 'NVIDIA Collaborative Project',
    category: 'Edge AI & Embedded Systems',
    highlight: 'NVIDIA Jetson',
    description: [
      'Built a real-time image processing and feature extraction pipeline on NVIDIA Jetson using OpenCV; developed frame-level object recognition algorithms (mean, standard deviation, checksum) to detect corrupted, frozen, and noisy frames from continuous camera streams.',
      'Handled end-to-end data pipeline for video frame analysis including data collection, cleaning, and curation; optimized inference for edge deployment on embedded NVIDIA hardware using Python.',
      'Documented architecture, findings, and evaluation results; communicated technical outcomes to cross-disciplinary stakeholders following structured reporting practices.',
    ],
    tech: ['NVIDIA Jetson', 'OpenCV', 'Python', 'NumPy', 'GMSL'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000',
  },
  {
    id: 'p2',
    title: 'Monocular Video-Based Road Scene 2D Mapping',
    year: '2025',
    collaborator: 'Senior Design Project',
    category: 'Computer Vision & ADAS',
    highlight: 'ViT + CNN Fusion',
    description: [
      'Implemented computer vision models for road segmentation, object detection, and distance estimation using PyTorch/TensorFlow and OpenCV; performed data preprocessing, analysis, and feature extraction on video datasets using NumPy and Pandas.',
      'Fine-tuned pre-trained CNN and Vision Transformer models for task-specific accuracy; generated 2D environment maps via homography-based perspective transformation — delivering a complete end-to-end CV pipeline from data to deployment.',
    ],
    tech: ['PyTorch', 'TensorFlow', 'OpenCV', 'NumPy', 'Pandas', 'ViT', 'CNNs'],
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000',
  },
  {
    id: 'p3',
    title: 'Industrial Defect Detection & Segmentation',
    year: '2025',
    category: 'Deep Learning & Quality Control',
    highlight: 'Image AUROC ≈ 1.00',
    description: [
      'Designed and implemented an object detection and image segmentation pipeline (PatchCore, MVTec dataset) using CNN-based feature extraction and OpenCV preprocessing; handled full data pipeline — collection, cleaning, curation, and annotation — achieving Image-level AUROC ≈ 1.00 and Pixel-level AUROC ≈ 0.98.',
      'Optimized and fine-tuned deep learning models for defect localization and classification; deployed end-to-end via Streamlit with anomaly heatmaps and overlay visualisation demonstrating real-world CV deployment experience.',
    ],
    tech: ['PatchCore', 'PyTorch', 'OpenCV', 'Streamlit', 'MVTec', 'CNN'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000',
  },
  {
    id: 'p4',
    title: 'Machine Learning Powered Malpractice Detection',
    year: '2024',
    collaborator: 'IMCL 2025 — Accepted & Presented',
    category: 'AI & Surveillance',
    highlight: '4,000+ img · 12 classes',
    description: [
      'Developed and implemented object detection models (YOLOv8, RetinaNet, PyTorch) for real-world behavioural classification; curated and annotated a 4,000+ image dataset with 12 classes — handling data collection, preprocessing, augmentation, and model training using Python, NumPy, and Pandas.',
      'Fine-tuned and optimized CNN architectures for accuracy and inference performance; conducted rigorous model evaluation across precision, recall, and speed — delivering production-ready models with documented trade-off analysis.',
      'Published: Sambhram G Doddamane et al. — IMCL 2025, International Conference on Intelligent Machine and Communication Learning Technologies, Bengaluru, India, November 2025.',
    ],
    tech: ['YOLOv8', 'RetinaNet', 'PyTorch', 'Python', 'NumPy', 'Pandas'],
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2000',
  },
  {
    id: 'p5',
    title: 'Video Super Resolution using GAN Model',
    year: '2025',
    category: 'Generative AI & Video',
    highlight: 'PSNR 25.65 dB · SSIM 0.73',
    description: [
      'Designed and implemented a GAN-based Video Super Resolution model (PyTorch) for frame enhancement; performed data preprocessing and augmentation on video datasets, optimized model architecture to 0.82M parameters, achieving PSNR of 25.65 dB and SSIM of 0.73.',
      'Fine-tuned model for deployment on resource-constrained devices; applied temporal feature extraction using optical flow and a temporal discriminator — demonstrating end-to-end deep learning model development, optimization, and evaluation.',
    ],
    tech: ['PyTorch', 'GAN', 'Optical Flow', 'Python', 'NumPy'],
    image: 'https://images.unsplash.com/photo-1536240478700-b869ad10a2eb?auto=format&fit=crop&q=80&w=2000',
  },
];

export const experience = [
  {
    role: 'Computer Vision Engineer Intern',
    company: 'Sandoz (via contractor)',
    period: 'Feb 2026 – Present',
    location: 'Remote',
    bullets: [
      'Developed and implemented computer vision models for industrial quality inspection using thermal imaging; handled end-to-end data pipelines including data collection, preprocessing, annotation, and model training using Python, NumPy, Pandas, and OpenCV.',
      'Trained and fine-tuned deep learning models (PyTorch, TensorFlow) for image segmentation and unsupervised anomaly detection; optimized model performance and accuracy iteratively on real-world manufacturing datasets.',
      'Collaborated with cross-functional teams for deployment and integration of CV solutions; documented model architectures, training configurations, and evaluation metrics for knowledge sharing and reproducibility.',
    ],
  },
  {
    role: 'Software Developer Intern',
    company: 'Spookfish Innovations Pvt Ltd',
    period: '2025',
    location: 'Bengaluru',
    bullets: [
      'Built a real-time image processing and feature extraction pipeline on NVIDIA Jetson using OpenCV; developed frame-level object recognition algorithms to detect corrupted, frozen, and noisy frames from continuous camera streams.',
      'Handled end-to-end data pipeline for video frame analysis including data collection, cleaning, and curation; optimized inference for edge deployment on embedded NVIDIA hardware using Python.',
      'Documented architecture, findings, and evaluation results; communicated technical outcomes to cross-disciplinary stakeholders following structured reporting practices.',
    ],
  },
];
