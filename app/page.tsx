'use client';

import LeftSidebar from '@/components/LeftSidebar';
import Live from '@/components/Live';
import Navbar from '@/components/Navbar';
import RightSidebar from '@/components/RightSidebar';
import { defaultNavElement } from '@/constants';
import {
	handleCanvasMouseDown,
	handleCanvasMouseUp,
	handleCanvasObjectModified,
	handleCanvaseMouseMove,
	handleResize,
	initializeFabric,
	renderCanvas
} from '@/lib/canvas';
import { handleDelete } from '@/lib/key-events';
import { ActiveElement } from '@/types/type';
import { useMutation, useStorage } from '@liveblocks/react/suspense';
import { fabric } from 'fabric';
import { useEffect, useRef, useState } from 'react';

const Home = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const isDrawing = useRef(false);
	const shapeRef = useRef<fabric.Object | null>(null);
	const selectedShapeRef = useRef<string | null>('');
	const activeObjectRef = useRef<fabric.Object | null>();

	const canvasObjects = useStorage(root => root.canvasObjects);

	const syncShapeInStorage = useMutation(({ storage }, object) => {
		if (!object) return;

		const { objectId } = object;
		const shapeData = object.toJSON();
		shapeData.objectId = objectId;
		const canvasObjects = storage.get('canvasObjects');
		canvasObjects.set(objectId, shapeData);
	}, []);

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

		canvas.on('mouse:move', options => {
			handleCanvaseMouseMove({
				options,
				canvas,
				isDrawing,
				shapeRef,
				selectedShapeRef,
				syncShapeInStorage
			});
		});

		canvas.on('mouse:up', options => {
			handleCanvasMouseUp({
				options,
				canvas,
				isDrawing,
				shapeRef,
				selectedShapeRef,
				syncShapeInStorage,
				setActiveElement,
				activeObjectRef
			});
		});

		canvas.on('object:modified', options => {
			handleCanvasObjectModified({
				options,
				syncShapeInStorage
			});
		});

		window.addEventListener('resize', () => {
			handleResize({ canvas: fabricRef.current });
		});

		return () => {
			canvas.dispose();
		};
	}, [syncShapeInStorage]);

	useEffect(() => {
		renderCanvas({
			fabricRef,
			canvasObjects,
			activeObjectRef
		});
	}, [canvasObjects]);

	const deleteAllShapes = useMutation(({ storage }) => {
		const canvasObjects = storage.get('canvasObjects');

		if (!canvasObjects || canvasObjects.size === 0) return true;
		for (const [key, value] of canvasObjects.entries()) {
			canvasObjects.delete(key);
		}
		return canvasObjects.size === 0;
	}, []);

	const deleteShapeFromStorage = useMutation(
		({ storage }, objectId) => {
			const canvasObjects = storage.get('canvasObjects');

			canvasObjects.delete(objectId);
		},
		[]
	);

	const handleActiveElement = (elem: ActiveElement) => {
		setActiveElement(elem);

		switch (elem?.value) {
			case 'reset':
				deleteAllShapes();
				fabricRef.current?.clear();
				setActiveElement(defaultNavElement);
				break;
			case 'delete':
				handleDelete(
					fabricRef.current as any,
					deleteShapeFromStorage
				);
				setActiveElement(defaultNavElement);
			default:
				break;
		}

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
				<LeftSidebar {...{ allShapes: Array.from(canvasObjects) }} />
				<Live {...{ canvasRef }} />
				<RightSidebar />
			</section>
		</main>
	);
};

export default Home;
