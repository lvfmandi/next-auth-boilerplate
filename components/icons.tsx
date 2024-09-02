import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { IconProps } from '@radix-ui/react-icons/dist/types';
import { FaFacebook } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';

const Icons = {
  close: Cross1Icon,
  facebook: FaFacebook,
  google: FcGoogle,
  menu: HamburgerMenuIcon,
};

type IconType = {
  name: keyof typeof Icons;
};

export const Icon = (props: IconType & IconProps) => {
  const { name } = props;

  const IconComponent = Icons[name];
  if (!IconComponent) return;

  return <IconComponent {...props} />;
};
