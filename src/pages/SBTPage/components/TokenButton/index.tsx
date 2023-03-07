import Icon, { IconName } from 'components/Icon';
import { ButtonHTMLAttributes } from 'react';

export enum Tokens {
  manta = 'manta',
  eth = 'eth',
  usdc = 'usdc',
  uni = 'uni',
  wbtc = 'wbtc',
  link = 'link',
  matic = 'matic',
  bnb = 'bnb',
  ustd = 'ustd',
  shib = 'shib',
  ldo = 'ldo',
  op = 'op',
  avax = 'avax',
  dot = 'dot',
  ksm = 'ksm'
}
export type TokenType = keyof typeof Tokens;
export enum levels {
  normal = 'normal',
  supreme = 'supreme',
  master = 'master'
}
export type LevelType = keyof typeof levels;

type TypeButtonProps = {
  checked: boolean;
  token: TokenType;
  level: LevelType;
  handleClickTokenBtn: (token: TokenType, level: LevelType) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

const TokenButton = ({
  token,
  checked,
  level,
  className,
  handleClickTokenBtn,
  ...otherProps
}: TypeButtonProps) => {
  const btnTxt =
    level !== levels.normal
      ? `${token.toLocaleUpperCase()} - ${level.toLocaleUpperCase()}`
      : token.toLocaleUpperCase();

  const normalCls = `token-${level}`;
  const finalStyle = checked ? `${normalCls} ${normalCls}-active` : normalCls;

  return (
    <button
      onClick={() => handleClickTokenBtn(token, level)}
      {...otherProps}
      className={`text-sm ml-4 mt-4 unselectable-text inline-flex justify-between border-2 border-white rounded-2xl cursor-pointer px-3 py-1 ${finalStyle} ${className}`}>
      <Icon name={token as IconName} className="w-6 h-6 rounded-full mr-2" />
      {btnTxt}
    </button>
  );
};

export default TokenButton;
