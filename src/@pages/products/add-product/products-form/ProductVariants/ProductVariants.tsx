import Icon from '@components/Icon';
import TextInput from '@components/TextInput';
import { IFilePayload } from '@interfaces/common.interface';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import generateVariants from 'utils/generateVariantList';
import './ProductVariants.scss';
import VariantImage from './VariantImage';

const VariantRow = ({ index, variant, isEditForm, hanleChooseImage }) => {
	const {
		getValues,
		register,
		watch,
		formState: { errors },
		clearErrors,
		setError,
	} = useFormContext();
	const sku = watch(`variants.${index}.sku`);

	useEffect(() => {
		if (sku) {
			const variants = getValues('variants');
			const has = variants?.some((v: any, idx: number) => idx !== index && v?.sku === sku);
			has
				? setError(`variants.${index}.sku`, {
						type: 'unique',
						message: 'SKU already exists',
				  })
				: clearErrors(`variants.${index}.sku`);
		}
	}, [sku, errors]);

	const rPriceLabel = `variants.${index}.price`;
	const dPriceLabel = `variants.${index}.discountPrice`;

	const [dPrice, rPrice] = watch([dPriceLabel, rPriceLabel]);

	useEffect(() => {
		if (+dPrice > 0 && +dPrice >= +rPrice) {
			setError(dPriceLabel, {
				message: 'Discount Price must be less than price',
				type: 'invalid',
			});
			setError(rPriceLabel, {
				message: 'Price must be less than Discount price',
				type: 'invalid',
			});
			return;
		}
		clearErrors([dPriceLabel, rPriceLabel]);
	}, [dPrice, rPrice, errors]);

	// const image = getValues(`variants.${index}.image`);

	return (
		<tr className='wx__tr'>
			{/* <td className='image-td'>
				<div
					className='image-box'
					role='button'
					onClick={() => (isEditForm ? hanleChooseImage(index) : null)}
				>
					{image ? (
						<img src={imageURLGenerate(image?.previewUrl)} alt='variant image' width='100%' />
					) : (
						<div className='dummy-image'>
							<Icon icon='add_photo_alternate' />
						</div>
					)}
				</div>
			</td> */}
			<td className='variant-name py-2'>
				<p className='mb-0 d-flex align-items-center'>
					{variant?.options?.map((val: any) => val?.value)?.join(' / ') || 'N/A'}
				</p>
			</td>
			<td className='quentity' style={{ width: 100 }}>
				<TextInput
					placeholder='Qty.'
					type='number'
					noMargin
					min={0}
					registerProperty={{
						...register(`variants.${index}.stock`, { valueAsNumber: true }),
					}}
					errorMessage={errors.stock?.message as string}
					color={errors.stock ? 'danger' : 'secondary'}
					onFocus={(e) => e.target.select()}
				/>
			</td>
			<td className='price'>
				<div>
					<TextInput
						type='number'
						noMargin
						placeholder='Price'
						min={0}
						registerProperty={{
							...register(rPriceLabel, {
								valueAsNumber: true,
							}),
						}}
						errorMessage={errors.variants?.[index]?.price?.message}
						color={errors.variants?.[index]?.price ? 'danger' : 'secondary'}
						onFocus={(e) => e.target.select()}
					/>
				</div>
			</td>
			<td className='price'>
				<TextInput
					type='number'
					noMargin
					placeholder='Price'
					min={0}
					registerProperty={{
						...register(dPriceLabel, {
							valueAsNumber: true,
						}),
					}}
					errorMessage={errors.variants?.[index]?.discountPrice?.message}
					color={errors.variants?.[index]?.discountPrice ? 'danger' : 'secondary'}
					onFocus={(e) => e.target.select()}
				/>
			</td>
			<td className='sku'>
				<TextInput
					noMargin
					color={errors.variants?.[index]?.sku ? 'danger' : 'secondary'}
					registerProperty={{
						...register(`variants.${index}.sku`),
					}}
					errorMessage={errors.variants?.[index]?.sku?.message}
					onFocus={(e) => e.target.select()}
				/>
			</td>
			<td className='barcode'>
				<TextInput
					noMargin
					registerProperty={{ ...register(`variants.${index}.barCode`) }}
					onFocus={(e) => e.target.select()}
				/>
			</td>
		</tr>
	);
};

const ProductVariants = ({ isEditForm }: { isEditForm?: boolean }) => {
	const [variantList, setVariantList] = useState<any[]>([]);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const prevOption = useRef<any[]>([]);
	const variantIndex = useRef<number | null>(null);
	const { watch, setValue, getValues } = useFormContext();

	const [hasVariants, options] = watch(['hasVariants', 'options']);

	useEffect(() => {
		if (options?.length === 1 && !options?.[0]?.values?.length) return;
		let [prevVariantList, parentPrice, parentDiscount, sku, stock] = getValues([
			'variants',
			'discountPrice',
			'price',
			'sku',
			'stock',
		]);
		prevVariantList = prevVariantList?.length ? [...prevVariantList] : [];
		let isTyping = checkTyping(options, prevOption.current);
		const newVariantList = makeVariantList(
			options,
			prevVariantList,
			parentPrice,
			parentDiscount,
			sku,
			stock,
			isTyping
		);
		setValue('variants', [...newVariantList]);
		setVariantList([...newVariantList]);
		prevOption.current = options?.length ? [...options] : [];
	}, [options]);

	const onModalClose = () => {
		variantIndex.current = null;
		setIsModalOpen(false);
	};

	const onAddNewImage = (imageList: IFilePayload[]) => {
		setValue('images', imageList);
	};

	const hanleChooseImage = (idx: number) => {
		variantIndex.current = idx;
		setIsModalOpen(true);
	};

	const onSelectImage = (imageObject: IFilePayload[], index: number) => {
		setValue(`variants.${index}.image`, imageObject?.[0]);
		setValue(`variants.${index}.imageId`, imageObject?.[0]?.id || null);
		onModalClose();
	};

	if (!hasVariants || variantList?.length === 0) return null;

	return (
		<div className='card product_variants p-3 mt-4'>
			<h6 className='d-flex align-items-center gap-3'>
				Variants <Icon icon='help' />
			</h6>
			<div className='variants_body'>
				<table className='wx__table'>
					<thead className='wx__thead'>
						<tr>
							{/* <th /> */}
							<th className='text-muted variant-name'>Variant</th>
							<th className='text-muted quentity'>Quantity</th>
							<th className='text-muted price'>Price</th>
							<th className='text-muted price'>Discount Price</th>
							<th className='text-muted sku'>SKU</th>
							<th className='text-muted barcode'>Barcode</th>
						</tr>
					</thead>
					<tbody className='wx__tbody'>
						{variantList.map((variant, idx) => (
							<VariantRow
								key={idx}
								index={idx}
								isEditForm={isEditForm}
								variant={variant}
								hanleChooseImage={hanleChooseImage}
							/>
						))}
					</tbody>
				</table>
			</div>
			<VariantImage
				isOpen={isModalOpen}
				getValues={getValues}
				onClose={onModalClose}
				variantIndex={variantIndex}
				onSelectImage={onSelectImage}
				onAddNewImage={onAddNewImage}
			/>
		</div>
	);
};

const checkTyping = (options = [], prevOption) => {
	let isTyping = false;
	options?.forEach((newOp) => {
		const preOp = prevOption?.find((val: any) => val.id === newOp.id);
		if (preOp) {
			newOp.values?.forEach((newVal: any) => {
				const preVal = preOp.values?.find((val: any) => val.id === newVal.id);
				if (newVal && preVal && newVal.name !== preVal.name) {
					isTyping = true;
				}
			});
		}
	});
	return isTyping;
};

const makeVariantList = (
	options = [],
	prevVariantList,
	parentPrice,
	parentDiscount,
	parentSKU,
	parentStock,
	isTyping = false
) => {
	prevVariantList = [...prevVariantList];
	return generateVariants(options).map((op, opIdx) => {
		if (isTyping) {
			return {
				...prevVariantList[opIdx],
				options: op,
			};
		}
		const prevVariantIdx = prevVariantList?.findIndex((p: any) =>
			p.options?.reduce(
				(acc: boolean, cur: any) => (!acc ? acc : op.map((o) => o.value).includes(cur.value)),
				true
			)
		);
		if (prevVariantIdx !== -1) {
			const newVariant = {
				...prevVariantList[prevVariantIdx],
				options: op,
			};
			prevVariantList.splice(prevVariantIdx, 1);
			return newVariant;
		}

		return {
			options: op,
			stock: parentStock || 0,
			sku: parentSKU ? `${parentSKU}-${op?.map((o) => o.value).join('-')}` : '',
			discountPrice: parentPrice,
			price: parentDiscount,
		};
	});
};

export default ProductVariants;
