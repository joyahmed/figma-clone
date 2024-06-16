import Image from 'next/image';
import styles from './Avatar.module.css';

/**
 * This file shows how to add live avatars like you can see them at the top right of a Google Doc or a Figma file.
 * https://liveblocks.io/docs/examples/live-avatars
 *
 * The users avatar and name are not set via the `useMyPresence` hook like the cursors.
 * They are set from the authentication endpoint.
 *
 * See pages/api/liveblocks-auth.ts and https://liveblocks.io/docs/api-reference/liveblocks-node#authorize for more information
 */

const Avatar = ({
	name,
	otherStyles
}: {
	otherStyles: string;
	name: string;
}) => {
	const imageSource = `https://liveblocks.io/avatars/avatar-${Math.floor(
		Math.random() * 30
	)}.png`;
	return (
		<div
			className={`${styles.avatar}} ${otherStyles} relative h-9 w-9`}
			data-tooltip={name}
		>
			<Image
				src={imageSource}
				alt={name}
				fill
				className={styles.avatar_picture}
			/>
		</div>
	);
};

export default Avatar;
