import CategoryPageBase from './CategoryPageBase';
import comidasImg from '../../assets/images/comidas.jpg';

const Comida = () => {
	const spotlight = [
		{ title: 'Pancakes y mezclas', description: 'Harinas proteicas listas para mezclar y obtener desayunos completos en minutos.' },
		{ title: 'Barras y galletas', description: 'Snacks con al menos 10 g de proteína para calmar antojos sin salirte del plan.' },
		{ title: 'Snacks funcionales', description: 'Chips, brownies y spreads con macros balanceados y azúcares controlados.' }
	];

	const usage = [
		{
			title: 'Desayunos rápidos',
			description: 'Combina pancakes proteicos con frutas o mantequilla de maní para un inicio de día saciante.'
		},
		{
			title: 'Post-entreno dulce',
			description: 'Barras y galletas con carbohidratos moderados recuperan glucógeno y entregan proteína completa.'
		},
		{
			title: 'On the go',
			description: 'Snacks en porciones individuales para mantener la ingesta de proteína cuando estás fuera de casa.'
		}
	];

	return (
		<CategoryPageBase
			title="Comidas con proteína"
			apiCategory="Comidas con proteína"
			pageTitle="Comidas con proteína - Tienda Suplementos"
			hero={{
				type: 'image',
				src: comidasImg,
				height: 'calc(100vh - 36px)',
				overlay: 'bg-black/30',
				content: (
					<div>
						<h2 className="text-5xl font-bold mb-4">Comidas con proteína</h2>
						<p className="text-xl max-w-2xl mx-auto">Snacks inteligentes y mezclas listas para cubrir tus macros sin complicaciones.</p>
					</div>
				)
			}}
			description={
				<div className="space-y-6 text-left">
					<p className="text-gray-700 leading-relaxed">
						Diseñamos esta categoría para quienes necesitan <strong>opciones listas</strong> durante el día: desayunos rápidos, snacks
						funcionales o postres altos en proteína que mantienen tus objetivos de recomposición corporal.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{spotlight.map((item) => (
							<div key={item.title} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
								<p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-3">Selección</p>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
								<p className="text-sm text-gray-600">{item.description}</p>
							</div>
						))}
					</div>
				</div>
			}
		>
			<div className="mb-12">
				<div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
					<h3 className="text-2xl font-semibold text-gray-900 mb-6">Cómo integrarlas en tu día</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{usage.map((use) => (
							<div key={use.title} className="rounded-2xl border border-gray-100 bg-white p-5">
								<p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">Idea</p>
								<h4 className="font-semibold text-gray-900 mb-2">{use.title}</h4>
								<p className="text-sm text-gray-600 leading-relaxed">{use.description}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</CategoryPageBase>
	);
};

export default Comida;
