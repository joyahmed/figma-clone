import useInterval from '@/hooks/useInterval';
import {
	CursorMode,
	CursorState,
	Presence,
	Reaction,
	ReactionEvent
} from '@/types/type';
import {
	useBroadcastEvent,
	useEventListener,
	useMyPresence,
	useOthers
} from '@liveblocks/react';
import { lazy, useCallback, useEffect, useState } from 'react';
import { ReactionSelector } from './reaction/ReactionButton';
const CursorChat = lazy(() => import('./cursor/CursorChat'));
const LiveCursors = lazy(() => import('./cursor/LiveCursors'));
const FlyingReaction = lazy(
	() => import('./reaction/FlyingReaction')
);

const Live = () => {
	const others = useOthers();
	const [{ cursor }, updateMyPresence] = useMyPresence() as any;
	const [cursorState, setCursorState] = useState<CursorState>({
		mode: CursorMode.Hidden
	});
	const [reactions, setReactions] = useState<Reaction[]>([]);
	const broadcast = useBroadcastEvent();

	// Remove reactions that are not visible anymore (every 1 sec)
	useInterval(() => {
		setReactions(reactions =>
			reactions.filter(
				reaction => reaction.timestamp > Date.now() - 4000
			)
		);
	}, 1000);

	// Broadcast the reaction to other users (every 100ms)
	useInterval(() => {
		if (
			cursorState.mode === CursorMode.Reaction &&
			cursorState.isPressed &&
			cursor
		) {
			const newReaction = {
				point: { x: cursor.x, y: cursor.y },
				value: cursorState.reaction,
				timestamp: Date.now()
			};

			// Update reactions state with the new reaction
			setReactions(reactions => [...reactions, newReaction]);

			// Broadcast the reaction to other users
			broadcast({
				x: cursor.x,
				y: cursor.y,
				value: cursorState.reaction
			});
		}
	}, 100);

	useEventListener(eventData => {
		const event = eventData.event as ReactionEvent;
		setReactions(reactions =>
			reactions.concat([
				{
					point: { x: event.x, y: event.y },
					value: event.value,
					timestamp: Date.now()
				}
			])
		);
	});

	const handlePointerMove = useCallback(
		(event: React.PointerEvent) => {
			event.preventDefault();

			if (
				cursor === null ||
				cursorState.mode !== CursorMode.ReactionSelector
			) {
				const x =
					event.clientX -
					event.currentTarget.getBoundingClientRect().x;
				const y =
					event.clientY -
					event.currentTarget.getBoundingClientRect().y;

				updateMyPresence({ cursor: { x, y } });
			}
		},

		[cursor, cursorState.mode, updateMyPresence]
	);

	const handlePointerLeave = useCallback(
		(event: React.PointerEvent) => {
			setCursorState(prev => ({
				...prev,
				mode: CursorMode.Hidden
			}));

			updateMyPresence({ cursor: null, message: null });
		},

		[updateMyPresence]
	);

	const handlePointerUp = useCallback(
		(event: React.PointerEvent) => {
			setCursorState(prev => {
				if (prev.mode === CursorMode.Reaction) {
					return {
						...prev,
						isPressed: true
					};
				}
				return prev; // Return previous state for other modes
			});
		},

		[setCursorState]
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent) => {
			const x =
				event.clientX - event.currentTarget.getBoundingClientRect().x;
			const y =
				event.clientY - event.currentTarget.getBoundingClientRect().y;

			updateMyPresence({ cursor: { x, y } });

			setCursorState(prev => {
				if (prev.mode === CursorMode.Reaction) {
					return {
						...prev,
						isPressed: true
					};
				}
				return prev; // Return previous state for other modes
			});
		},

		[setCursorState, updateMyPresence]
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
			} else if (e.key === 'e') {
				setCursorState({
					mode: CursorMode.ReactionSelector
				});
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

	const handleSetReaction = useCallback((reaction: string) => {
		setCursorState({
			mode: CursorMode.Reaction,
			reaction,
			isPressed: false
		});
	}, []);

	return (
		<div
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			onPointerUp={handlePointerUp}
			onPointerDown={handlePointerDown}
			className='flex items-center justify-center h-screen w-full'
		>
			<h1 className='text-2xl text-white'>Liveblocks</h1>

			{reactions.map(r => (
				<FlyingReaction
					key={r.timestamp.toString()}
					{...{
						x: r.point.x,
						y: r.point.y,
						timestamp: r.timestamp,
						value: r.value
					}}
				/>
			))}
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

			{cursorState.mode === CursorMode.ReactionSelector ? (
				<ReactionSelector
					{...{
						setReaction: handleSetReaction
					}}
				/>
			) : null}
			<LiveCursors {...{ others }} />
		</div>
	);
};

export default Live;
