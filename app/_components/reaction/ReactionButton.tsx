import React from 'react';

type Props = {
	setReaction: (reaction: string) => void;
};

const reactionsArray = ['👍', '🔥', '😍', '👀', '😱', '🙁'];

export const ReactionSelector = ({ setReaction }: Props) => {
	return (
		<div
			className='absolute bottom-20 left-0 right-0 mx-auto w-fit tranform rounded-full bg-black/20 px-2'
			onPointerMove={e => e.stopPropagation()}
		>
			{reactionsArray.map(item => (
				<ReactionButton
					key={item}
					{...{ reaction: item, onSelect: setReaction }}
				/>
			))}
		</div>
	);
};

const ReactionButton = ({
	reaction,
	onSelect
}: {
	reaction: string;
	onSelect: (reaction: string) => void;
}) => {
	return (
		<button
			className='transform select-none p-2 text-xl transition-transform hover:scale-150 focus:scale-150 focus:outline-none'
			onPointerDown={() => onSelect(reaction)}
		>
			{reaction}
		</button>
	);
};

export default ReactionButton;
