'use client';

import {
	handleCanvasMouseDown,
	handleResize,
	initializeFabric
} from '@/lib/canvas';
import { fabric } from 'fabric';
import { useEffect, useRef } from 'react';
import LeftSidebar from './_components/LeftSidebar';
import Live from './_components/Live';
import Navbar from './_components/Navbar';
import RightSidebar from './_components/RightSidebar';

const Home = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const isDrawing = useRef(false);
	const shapeRef = useRef<fabric.Object | null>(null);
	const selectedShapeRef = useRef<string | null>(null);

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
	return (
		<main className='h-screen overflow-hidden'>
			<Navbar />
			<section className='flex h-full flex-row'>
				<LeftSidebar />
				<Live {...{ canvasRef }} />
				<RightSidebar />
			</section>
		</main>
	);
};

export default Home;
