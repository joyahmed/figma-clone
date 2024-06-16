import { generateRandomName } from '@/lib/utils';
import { useOthers } from '@liveblocks/react';
import { useSelf } from '@liveblocks/react/suspense';
import { useMemo } from 'react';
import Avatar from './Avatar';

const ActiveUsers = () => {
	const users = useOthers();
	const currentUser = useSelf();
	const hasMoreUsers = users.length > 3;

	const memoizedUsers = useMemo(() => {
		return (
			<div className='flex items-center justify-center gap-1 py-2'>
				<div className='flex pl-3'>
					{currentUser && <Avatar name='You' otherStyles='' />}

					{users.slice(0, 3).map(({ connectionId }) => {
						return (
							<Avatar
								key={connectionId}
								name={generateRandomName()}
								otherStyles='-ml-3'
							/>
						);
					})}

					{hasMoreUsers && (
						<div className='more'>+{users.length - 3}</div>
					)}
				</div>
			</div>
		);
		//eslint-disable-next-line
	}, [users.length]);

	return memoizedUsers;
};

export default ActiveUsers;
