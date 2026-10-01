export type ShowAccount = {
  handle: string;
  href: string;
  label: string;
  name: string;
};

export const showXAccounts: ShowAccount[] = [
  {
    handle: 'shipshitdev',
    href: 'https://x.com/shipshitdev',
    label: 'Show',
    name: 'Ship Sh!t',
  },
  {
    handle: 'VincentShipsIt',
    href: 'https://x.com/VincentShipsIt',
    label: 'Host',
    name: 'Vincent',
  },
];

export const showYoutubeChannels: ShowAccount[] = [
  {
    handle: 'shipshitshow',
    href: 'https://www.youtube.com/@shipshitshow',
    label: 'Main',
    name: 'YouTube',
  },
  {
    handle: 'ShipShitShowClips',
    href: 'https://www.youtube.com/@ShipShitShowClips',
    label: 'Clips',
    name: 'YouTube',
  },
];
