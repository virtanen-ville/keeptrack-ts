import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectCard from "../ProjectCard";

describe("<ProjectCard />", () => {
	let project: any = {};
	let handleEditMock: jest.Mock = jest.fn();

	const setup = () => {
		render(
			<MemoryRouter>
				<ProjectCard project={project} onEdit={handleEditMock} />
			</MemoryRouter>
		);
	};
	// Before every test case, we want to reset the mock function and the project object
	beforeEach(() => {
		project = {
			id: 111,
			name: "Testiprojekti",
			description: "Testikuvaus",
			budget: 10,
			imageUrl: "/assets/placeimg_500_300_arch12.jpg",
			contractTypeId: 2,
			contractSignedOn: new Date("2009-12-18T21:46:47.944Z"),
			isActive: true,
			isNew: false,
		};
		handleEditMock = jest.fn();
	});

	// ! Smoke test
	test("should render without crashing", () => {
		setup();
	});

	// Test that the relevant info is rendered
	// ! Integration test
	test("renders project properly", () => {
		setup();
		expect(screen.getByRole("heading")).toHaveTextContent(project.name);
		expect(screen.getByText(/testikuvaus/i)).toBeInTheDocument();
		expect(screen.getByText(/budget : 10/i)).toBeInTheDocument();
	});

	// Test that the edit button calls the correct function and passes the correct project
	// ! Unit test
	test("should call handler when edit is clicked", async () => {
		//const user = userEvent.setup();
		setup();
		const editButton = await screen.findByRole("button", { name: /edit/i });
		fireEvent.click(editButton);
		//await user.click(screen.getByRole("button", { name: /edit/i }));
		expect(handleEditMock).toBeCalledTimes(1);
		expect(handleEditMock).toBeCalledWith(project);
	});

	// Test that the project has a link that takes to the correct url
	// ! Unit test
	test("should have a link to the clicked project", async () => {
		setup();
		const projectLink = await screen.findByRole("link");
		expect(projectLink).toHaveAttribute("href", `/projects/${project.id}`);
	});
});
