'use client';

import { FC, FormEvent, useState } from 'react';
import {
	login,
	loginInTM,
	NAME_ACCESS_TOKEN,
	NAME_EXPIRES_ACCESS,
	NAME_SESSION,
	ResponseServerType,
	ResponseServerWithSessionType,
} from '@auth';
import classNames from 'classnames';
import Cookies from 'js-cookie';

import { useRouter } from '@/shared/navigation';
import { Button, Card, Input } from '@/shared/ui';

import { LoginFormHead } from '../LoginFormHead';

import styles from './LoginForm.module.css';

const clearAllCookies = () => {
	const cookies = document.cookie.split('; ');
	cookies.forEach((cookie) => {
		const cookieName = cookie.split('=')[0];
		document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; Max-Age=0;`;
	});
};

export const LoginForm: FC = () => {
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	const handleError = (errorMsg: string) => {
		clearAllCookies();
		setError(errorMsg);
		setIsPending(false);
	};

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setIsPending(true);

		const formData = new FormData(event.currentTarget);

		try {
			const loginResult: ResponseServerType = await login(formData);
			if (!loginResult.success && loginResult.error) return handleError(loginResult.error);

			const accessToken = Cookies.get(NAME_ACCESS_TOKEN);
			const expires = Cookies.get(NAME_EXPIRES_ACCESS);

			const checkResult: ResponseServerWithSessionType = await loginInTM({
				accessToken: accessToken as string,
				expiresAt: expires as string,
			});

			if (!checkResult.success && checkResult.error) return handleError(checkResult.error);

			Cookies.set(NAME_SESSION, JSON.stringify(checkResult.session), {
				path: '/',
				expires: 1 / 24,
			});

			router.push('/');
			router.refresh();
		} catch (error) {
			console.error(error);
			handleError('Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.');
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Card className={styles.container}>
			<form onSubmit={onSubmit} className={styles.form}>
				<LoginFormHead />

				<div className={styles.body}>
					<Input
						name="email"
						label="Электронная почта"
						type="email"
						id="email"
						placeholder="Введите вашу почту"
						className={styles.field}
						disabled={isPending}
						required
					/>
					<Input
						name="password"
						label="Пароль"
						type="password"
						id="password"
						placeholder="Введите ваш пароль"
						className={styles.field}
						disabled={isPending}
						required
					/>
				</div>

				<div className={styles.footer}>
					<Button disabled={isPending} loading={isPending} type="submit" className={styles.action}>
						Войти
					</Button>

					{error && <span className={classNames(styles.errorMessage, 'system-typo-100')}>{error}</span>}
				</div>
			</form>
		</Card>
	);
};
