import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectList from "../ProjectList";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { store } from "../../state";
import { allProjects } from "../mockProjects";
import { Project } from "../Project";

describe("<ProjectList />", () => {
	// Pass in the projects as props to the component
	const mockProjects = allProjects
		.sort((a: Project, b: Project) => a.name.localeCompare(b.name))
		.slice(0, 20);
	const setup = () =>
		render(
			<Provider store={store}>
				<MemoryRouter>
					<ProjectList projects={mockProjects} />
				</MemoryRouter>
			</Provider>
		);

	// We test that the conmponent renders without crashing
	// ! Unit test
	test("should render without crashing", () => {
		setup();
		expect(screen).toBeDefined();
	});

	// We test that the component renders the correct number of projects
	// ! Unit test
	test("should display list", () => {
		setup();
		expect(screen.getAllByRole("heading")).toHaveLength(
			mockProjects.length
		);
		expect(screen.getAllByRole("img")).toHaveLength(mockProjects.length);
		expect(screen.getAllByRole("link")).toHaveLength(mockProjects.length);
		expect(screen.getAllByRole("button")).toHaveLength(mockProjects.length);
	});

	// Test that the component shows a form of the clicked project
	// ! Unit test
	test("should display form when edit clicked", async () => {
		setup();
		const view = userEvent.setup();
		const editButton = screen.getByRole("button", {
			name: /edit armstrong, crona and ziemann/i,
		});
		await view.click(editButton);
		expect(
			screen.getByRole("form", {
				name: /edit a project/i,
			})
		).toBeInTheDocument();
	});

	// Test that the component removes the form when cancel clicked and again shows clicked project as normal card
	// ! Unit test
	test("should display image and remove form when cancel clicked", async () => {
		setup();
		const view = userEvent.setup();
		const editButton = screen.getByRole("button", {
			name: /edit armstrong, crona and ziemann/i,
		});

		await view.click(editButton);
		await view.click(
			screen.getByRole("button", {
				name: /cancel/i,
			})
		);
		expect(
			screen.getByRole("img", {
				name: /armstrong, crona and ziemann/i,
			})
		).toBeInTheDocument();
		expect(
			screen.queryByRole("form", {
				name: /edit a project/i,
			})
		).not.toBeInTheDocument();
	});
});
