type BannerType = 'info' | 'warning' | 'critical';
type BannerPosition = 'top' | 'bottom';
interface BannerProps {
  type?: BannerType;
  position?: BannerPosition;
  children: JSX.Element;
}

import { useState } from 'react';
import styles from './Banner.module.scss';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Banner(props: BannerProps) {
  const { type, position, children } = props;
  const [dismiss, setDismiss] = useState(false);

  if (dismiss) return <></>;
  return (
    <div
      className={styles.banner}
      data-type={type || 'info'}
      data-position={position || 'top'}
    >
      <div className={styles.content}>{children}</div>
      <div className={styles.dismissButton}>
        <button onClick={() => setDismiss(true)} title={'Click to dismiss'}>
          <FontAwesomeIcon className={styles.icon} icon={faXmark} />
        </button>
      </div>
    </div>
  );
}
