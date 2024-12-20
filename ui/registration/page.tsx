import { getLocale } from 'next-intl/server';

import styles from './RegistrationPage.module.css';

export default async function Page() {
	const locale = await getLocale();
	const iframeSrc = `https://cityads.com/main/register/publisher?lang=${locale}&theme=material`;

	return (
		<div className={styles.container}>
			<iframe className={styles.iframe} src={iframeSrc} width="100%" height="100%" title="CityAds Registration" />
		</div>
	);
}
