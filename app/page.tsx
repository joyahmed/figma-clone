'use client';

import LeftSidebar from '@/components/LeftSidebar';
import Live from '@/components/Live';
import Navbar from '@/components/Navbar';
import RightSidebar from '@/components/RightSidebar';
import {
	handleCanvasMouseDown,
	handleResize,
	initializeFabric
} from '@/lib/canvas';
import { ActiveElement } from '@/types/type';
import { fabric } from 'fabric';
import { useEffect, useRef, useState } from 'react';

const Home = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const isDrawing = useRef(false);
	const shapeRef = useRef<fabric.Object | null>(null);
	const selectedShapeRef = useRef<string | null>(null);
	const [activeElement, setActiveElement] = useState<ActiveElement>({
		name: '',
		value: '',
		icon: ''
	});

	useEffect(() => {
		const canvas = initializeFabric({ canvasRef, fabricRef });

		canvas.on('mouse:down', options => {
			handleCanvasMouseDown({
				options,
				canvas,
				isDrawing,
				shapeRef,
				selectedShapeRef
			});
		});

		window.addEventListener('resize', () => {
			handleResize({ canvas: fabricRef.current });
		});
	}, []);

	const handleActiveElement = (elem: ActiveElement) => {
		setActiveElement(elem);

		selectedShapeRef.current = elem?.value as string;
	};

	return (
		<main className='h-screen overflow-hidden'>
			<Navbar
				{...{
					activeElement,
					handleActiveElement
				}}
			/>
			<section className='flex h-full flex-row'>
				<LeftSidebar />
				<Live {...{ canvasRef }} />
				<RightSidebar />
			</section>
		</main>
	);
};

export default Home;
