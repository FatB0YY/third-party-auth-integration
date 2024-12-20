'use client';

import { FC } from 'react';
import classNames from 'classnames';

import { Link } from '@/shared/navigation';
import { NavigationLine } from '@/shared/ui';

import styles from './LoginFormHead.module.css';

export const LoginFormHead: FC = () => {
	return (
		<div className={styles.head}>
			<h2 className={classNames(styles.title, 'system-typo-h4')}>Вход в систему</h2>
			<Link href={'/'}>
				<NavigationLine onClose={() => {}} />
			</Link>
		</div>
	);
};
