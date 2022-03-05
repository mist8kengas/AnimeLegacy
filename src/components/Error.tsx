import styles from './Error.module.scss';

interface ErrorProps {
  status: number;
  message: string;
}

export default function Error(props: ErrorProps) {
  const { status, message } = props;
  return (
    <div className={styles.label}>
      <div>
        <h1>
          <i>{status}</i>&nbsp;&nbsp;{message}
        </h1>
      </div>
    </div>
  );
}
