import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectList from "../ProjectList";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { store } from "../../state";
import { mockProjects } from "../mockProjects";

describe("<ProjectList />", () => {
	const setup = () =>
		render(
			<Provider store={store}>
				<MemoryRouter>
					<ProjectList projects={mockProjects} />
				</MemoryRouter>
			</Provider>
		);

	test("should render without crashing", () => {
		setup();
		expect(screen).toBeDefined();
	});

	test("should display list", () => {
		setup();
		expect(screen.getAllByRole("heading")).toHaveLength(
			mockProjects.length
		);
		expect(screen.getAllByRole("img")).toHaveLength(mockProjects.length);
		expect(screen.getAllByRole("link")).toHaveLength(mockProjects.length);
		expect(screen.getAllByRole("button")).toHaveLength(mockProjects.length);
	});

	test("should display form when edit clicked", async () => {
		setup();
		const view = userEvent.setup();
		await view.click(
			screen.getByRole("button", { name: /edit Testi Nimi 1/i })
		);
		expect(
			screen.getByRole("form", {
				name: /edit a project/i,
			})
		).toBeInTheDocument();
	});

	test("should display image and remove form when cancel clicked", async () => {
		setup();
		const view = userEvent.setup();
		await view.click(
			screen.getByRole("button", { name: /edit Testi Nimi 1/i })
		);
		await view.click(
			screen.getByRole("button", {
				name: /cancel/i,
			})
		);
		expect(
			screen.getByRole("img", {
				name: /Testi Nimi 1/i,
			})
		).toBeInTheDocument();
		expect(
			screen.queryByRole("form", {
				name: /edit a project/i,
			})
		).not.toBeInTheDocument();
	});
});
