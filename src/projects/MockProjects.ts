import { Project } from "./Project";
export const mockProjects = [
	new Project({
		id: 1,
		name: "Testi Nimi 1",
		description: "Testi kuvaus 1",
		imageUrl: "/assets/placeimg_500_300_arch4.jpg",
		contractTypeId: 3,
		contractSignedOn: "2022-08-04T22:39:41.473Z",
		budget: 100000,
		isActive: true,
	}),
	new Project({
		id: 2,
		name: "Testi Nimi 2",
		description: "Testi kuvaus 2",
		imageUrl: "/assets/placeimg_500_300_arch4.jpg",
		contractTypeId: 3,
		contractSignedOn: "2022-08-04T22:39:41.473Z",
		budget: 200000,
		isActive: false,
	}),
	new Project({
		id: 3,
		name: "Testi Nimi 3",
		description: "Testi kuvaus 3",
		imageUrl: "/assets/placeimg_500_300_arch4.jpg",
		contractTypeId: 3,
		contractSignedOn: "2022-08-04T22:39:41.473Z",
		budget: 50000,
		isActive: true,
	}),
	new Project({
		id: 4,
		name: "Testi Nimi 4",
		description: "Testi kuvaus 4",
		imageUrl: "/assets/placeimg_500_300_arch4.jpg",
		contractTypeId: 3,
		contractSignedOn: "2022-08-04T22:39:41.473Z",
		budget: 150000,
		isActive: false,
	}),
];

export const mockProject = new Project({
	id: 2,
	name: "Testi Nimi 5",
	description: "Testi kuvaus 5",
	imageUrl: "/assets/placeimg_500_300_arch4.jpg",
	contractTypeId: 1,
	contractSignedOn: "2022-08-04T22:39:41.473Z",
	budget: 300000,
	isActive: true,
});
