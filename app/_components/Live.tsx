import { CursorMode, CursorState } from '@/types/type';
import { useMyPresence, useOthers } from '@liveblocks/react';
import { useCallback, useEffect, useState } from 'react';
import CursorChat from './cursor/CursorChat';
import LiveCursors from './cursor/LiveCursors';

const Live = () => {
	const others = useOthers();
	const [{ cursor }, updateMyPresence] = useMyPresence() as any;
	const [cursorState, setCursorState] = useState<CursorState>({
		mode: CursorMode.Hidden
	});

	const handlePointerMove = useCallback(
		(event: React.PointerEvent) => {
			event.preventDefault();
			const x =
				event.clientX - event.currentTarget.getBoundingClientRect().x;
			const y =
				event.clientY - event.currentTarget.getBoundingClientRect().y;

			updateMyPresence({ cursor: { x, y } });
		},
		//eslint-disable-next-line
		[]
	);

	const handlePointerLeave = useCallback(
		(event: React.PointerEvent) => {
			setCursorState(prev => ({
				...prev,
				mode: CursorMode.Hidden
			}));

			updateMyPresence({ cursor: null, message: null });
		},
		//eslint-disable-next-line
		[]
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent) => {
			const x =
				event.clientX - event.currentTarget.getBoundingClientRect().x;
			const y =
				event.clientY - event.currentTarget.getBoundingClientRect().y;

			updateMyPresence({ cursor: { x, y } });
		},
		//eslint-disable-next-line
		[]
	);

	useEffect(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === '/') {
				setCursorState({
					mode: CursorMode.Chat,
					previousMessage: null,
					message: ''
				});
			} else if (e.key === 'Escape') {
				updateMyPresence({ message: '' });
				setCursorState(prev => ({
					...prev,
					mode: CursorMode.Hidden
				}));
			}
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === '/') {
				e.preventDefault();
			}
		};
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [updateMyPresence]);

	return (
		<div
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			onPointerDown={handlePointerDown}
			className='flex items-center justify-center h-screen w-full'
		>
			<h1 className='text-2xl text-white'>Liveblocks</h1>
			{cursor ? (
				<CursorChat
					{...{
						cursor,
						cursorState,
						setCursorState,
						updateMyPresence
					}}
				/>
			) : null}
			<LiveCursors {...{ others }} />
		</div>
	);
};

export default Live;
