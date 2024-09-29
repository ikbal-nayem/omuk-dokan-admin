import TableRows from "./TableRows";

type CategoryTableProps = {
	data?: any[];
	handleEdit?: Function;
	handleVisibility?: Function;
	handleDelete?: Function;
	handleCreateSubcategory?: Function;
};

const CategoryTable = ({
	data,
	handleEdit,
	handleVisibility,
	handleDelete,
	handleCreateSubcategory,
}: CategoryTableProps) => {
	return (
		<div className="wx__card wx__mt-3 wx__responsive_table">
			<table className="wx__table">
				<thead className="wx__thead">
					<tr className="wx__tr">
						<th className="wx__th wx__w-50">Category Name</th>
						<th className="wx__th">Products</th>
						<th className="wx__th">Visibility</th>
						<th className="wx__th" style={{ width: 50 }} />
					</tr>
				</thead>
				<tbody>
					<TableRows
						data={data}
						handleEdit={handleEdit}
						handleVisibility={handleVisibility}
						handleDelete={handleDelete}
						handleCreateSubcategory={handleCreateSubcategory}
					/>
				</tbody>
			</table>
		</div>
	);
};

export default CategoryTable;
