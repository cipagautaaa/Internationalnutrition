import CategoryPageBase from './CategoryPageBase';
import creatinasImg from '../../assets/images/creatinas.jpg';

export default function Creatina() {
	return (
		<CategoryPageBase
			title="Creatinas"
			apiCategory="Creatinas"
			pageTitle="Creatinas - Tienda Suplementos"
			hero={{
				type: 'image',
				src: creatinasImg,
				height: 'calc(100vh - 36px)',
				overlay: 'bg-black/30',
				content: (
					<div>
						<h2 className="text-5xl font-bold mb-4">Creatinas</h2>
						<p className="text-xl max-w-2xl mx-auto">Monohidrato, HCL y fórmulas avanzadas para fuerza y potencia.</p>
					</div>
				)
			}}
			description={<p className="text-left">Optimiza tu rendimiento y recuperación con nuestras creatinas premium seleccionadas.</p>}
		/>
	);
}