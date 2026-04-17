// SVG icon set — 20x20, currentColor, strokeWidth 1.5
// Style: Heroicons-inspired, clean geometric

type IconProps = { size?: number; className?: string; style?: React.CSSProperties }

const i = (path: React.ReactNode, props: IconProps) => (
  <svg
    width={props.size ?? 18}
    height={props.size ?? 18}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
    aria-hidden="true"
  >
    {path}
  </svg>
)

export const BuildingIcon = (p: IconProps) => i(<>
  <rect x="2" y="7" width="10" height="12" rx="1" />
  <path d="M12 10h4a1 1 0 0 1 1 1v8H12" />
  <path d="M6 11v.01M6 14v.01M6 17v.01M9 11v.01M9 14v.01M9 17v.01" strokeWidth="2" />
</>, p)

export const UsersIcon = (p: IconProps) => i(<>
  <path d="M14 15c0-2.21-1.79-4-4-4s-4 1.79-4 4" />
  <circle cx="10" cy="7" r="3" />
  <path d="M16.5 15c0-1.66-1.34-3-3-3" opacity=".5" />
  <circle cx="15.5" cy="6" r="2.25" opacity=".5" />
</>, p)

export const CameraIcon = (p: IconProps) => i(<>
  <path d="M2 8a2 2 0 0 1 2-2h1.5l1.5-2h6l1.5 2H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z" />
  <circle cx="10" cy="12" r="3" />
</>, p)

export const BookIcon = (p: IconProps) => i(<>
  <path d="M4 3h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3Z" />
  <path d="M15 7h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2" />
  <path d="M7 7h4M7 10h4M7 13h4" strokeWidth="1.4" />
</>, p)

export const ChartIcon = (p: IconProps) => i(<>
  <path d="M3 17V13M7 17V9M11 17V11M15 17V7" />
  <path d="M3 13l4-4 4 2 4-4" strokeWidth="1.4" opacity=".5" />
</>, p)

export const DownloadIcon = (p: IconProps) => i(<>
  <path d="M10 3v10M6 9l4 4 4-4" />
  <path d="M3 17h14" />
</>, p)

export const PencilIcon = (p: IconProps) => i(<>
  <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828L7 15.828 3 17l1.172-4L13.586 3.586Z" />
</>, p)

export const CheckIcon = (p: IconProps) => i(<>
  <path d="M4 10l4.5 4.5L16 6" />
</>, p)

export const XIcon = (p: IconProps) => i(<>
  <path d="M5 5l10 10M15 5L5 15" />
</>, p)

export const AlertIcon = (p: IconProps) => i(<>
  <path d="M10 3L2 17h16L10 3Z" />
  <path d="M10 9v4M10 15v.01" strokeWidth="2" />
</>, p)

export const StarIcon = (p: IconProps) => i(<>
  <path d="M10 2l2.39 4.84 5.34.78-3.86 3.76.91 5.33L10 14.27l-4.78 2.51.91-5.33L2.27 7.62l5.34-.78L10 2Z" />
</>, p)

export const LockIcon = (p: IconProps) => i(<>
  <rect x="4" y="9" width="12" height="10" rx="2" />
  <path d="M7 9V6a3 3 0 0 1 6 0v3" />
</>, p)

export const LogOutIcon = (p: IconProps) => i(<>
  <path d="M13 17h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4M8 13l-3-3 3-3M5 10h8" />
</>, p)

export const ChevronRightIcon = (p: IconProps) => i(<>
  <path d="M8 5l5 5-5 5" />
</>, p)

export const ArrowLeftIcon = (p: IconProps) => i(<>
  <path d="M15 10H5M9 6l-4 4 4 4" />
</>, p)

export const GridIcon = (p: IconProps) => i(<>
  <rect x="3" y="3" width="6" height="6" rx="1" />
  <rect x="11" y="3" width="6" height="6" rx="1" />
  <rect x="3" y="11" width="6" height="6" rx="1" />
  <rect x="11" y="11" width="6" height="6" rx="1" />
</>, p)

export const FilterIcon = (p: IconProps) => i(<>
  <path d="M3 5h14M6 10h8M9 15h2" />
</>, p)

export const SettingsIcon = (p: IconProps) => i(<>
  <circle cx="10" cy="10" r="3" />
  <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" strokeWidth="1.4" />
</>, p)

export const TrashIcon = (p: IconProps) => i(<>
  <path d="M3 6h14M8 6V4h4v2M5 6l1 11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-11" />
  <path d="M9 10v4M11 10v4" strokeWidth="1.4" />
</>, p)

export const PlusIcon = (p: IconProps) => i(<>
  <path d="M10 4v12M4 10h12" />
</>, p)

export const RefreshIcon = (p: IconProps) => i(<>
  <path d="M4 10a6 6 0 1 0 1.5-4" />
  <path d="M4 4v3h3" />
</>, p)

export const CopyIcon = (p: IconProps) => i(<>
  <rect x="8" y="8" width="9" height="9" rx="1.5" />
  <path d="M12 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3" />
</>, p)

export const MapIcon = (p: IconProps) => i(<>
  <path d="M2 5l6-2 4 2 6-2v12l-6 2-4-2-6 2V5Z" />
  <path d="M8 3v12M12 5v12" strokeWidth="1.4" opacity=".5" />
</>, p)

export const ShareIcon = (p: IconProps) => i(<>
  <circle cx="16" cy="5" r="2" />
  <circle cx="4" cy="10" r="2" />
  <circle cx="16" cy="15" r="2" />
  <path d="M6 10.5l8-4.5M6 9.5l8 4.5" strokeWidth="1.4" />
</>, p)

export const QrCodeIcon = (p: IconProps) => i(<>
  <rect x="3" y="3" width="6" height="6" rx="1" />
  <rect x="11" y="3" width="6" height="6" rx="1" />
  <rect x="3" y="11" width="6" height="6" rx="1" />
  <path d="M11 11h2v2h-2zM15 11h2M11 15h2M15 15v2M13 13h4" strokeWidth="1.4" />
</>, p)
