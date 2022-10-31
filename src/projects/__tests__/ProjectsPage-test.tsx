import { BrowserRouter, MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory, createBrowserHistory } from "history";

import ProjectsPage from "../ProjectsPage";
import {
	screen,
	waitForElementToBeRemoved,
	fireEvent,
	render,
	waitFor,
	within,
} from "@testing-library/react";
import { Project } from "../Project";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Provider } from "react-redux";
import { store } from "../../state";
import { allProjects } from "../mockProjects";
import App from "../../App";

// We mock a server with msw and return a mocked response that has the projects as JSON. This server get function is called at the useEffect hook in ProjectsPage.tsx
const handlers = [
	rest.get("http://localhost:4000/projects", (req, res, ctx) => {
		const page: number = Number(req.url.searchParams.get("page")) || 1;
		let limit: number = Number(req.url.searchParams.get("limit")) || 20;
		// const sort: string = req.url.searchParams.get("sort") || "id";
		const projects = allProjects
			.sort((a: Project, b: Project) => a.name.localeCompare(b.name))
			.slice((page - 1) * limit, page * limit);
		// limit the response to query params limit and page

		return res(ctx.json(projects));
	}),
	// get a single project
	rest.get("http://localhost:4000/projects/:id", (req, res, ctx) => {
		const id = Number(req.params.id);
		const project = allProjects.find((p: Project) => p.id === id);
		if (project) {
			return res(ctx.json(project));
		} else {
			return res(ctx.status(404));
		}
	}),

	rest.put("http://localhost:4000/projects/*", (req, res, ctx) => {
		return res(ctx.json(req.body));
	}),
];

const server = setupServer(...handlers);

describe("<ProjectsPage />", () => {
	const setup = () => {
		render(
			<Provider store={store}>
				<MemoryRouter>
					<ProjectsPage />
				</MemoryRouter>
			</Provider>
		);
	};

	// We start the server before the tests and close it after the tests. In between we can reset the handlers if we need to.
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	// We test that the conmponent renders without crashing
	// ! Unit test
	test("should render the component without crashing", () => {
		setup();
	});

	// We test that the loading text is displayed when the component is rendered (and data is not yet fetched)
	// ! Unit test
	test("should show 'loading' text when loading data", () => {
		setup();
		const loadingText = screen.getByText(/loading/i);
		expect(loadingText).toBeInTheDocument();
	});

	// Test that the projects title is displayed when the data is fetched (after loading text is removed)
	// ! Unit test
	test("should show Projects title", () => {
		setup();
		expect(
			screen.getByRole("heading", { name: /projects/i })
		).toBeInTheDocument();
	});

	// Test for showing more button
	// ! Unit test
	test("should show a 'more' button", async () => {
		setup();
		expect(
			await screen.findByRole("button", { name: /more/i })
		).toBeInTheDocument();
	});

	// We test that the projects are displayed when the data is fetched. This is already an integration test, but this component itself has pretty much nothing to test.
	// ! Integration test
	test("should show right amount of projects", async () => {
		setup();
		expect(await screen.findAllByRole("img")).toHaveLength(20);
	});

	test("should show correct errors on server error", async () => {
		server.use(
			rest.get("http://localhost:4000/projects", (req, res, ctx) => {
				return res(ctx.status(500));
			})
		);
		setup();
		expect(
			await screen.findByText(
				/There was an error retrieving the projects. Please try again./i
			)
		).toBeInTheDocument();
	});

	// This is pretty extensive integration test, to test changing information and getting it on screen
	// ! Integration test
	test("should open form and get input and change information", async () => {
		setup();

		let nameTextBox1 = screen.queryByRole("textbox", {
			name: /project name/i,
		});
		expect(nameTextBox1).not.toBeInTheDocument();
		const editButton = screen.getByRole("button", {
			name: /edit armstrong, crona and ziemann/i,
		});

		fireEvent.click(editButton);
		let nameTextBox = screen.getByRole("textbox", {
			name: /project name/i,
		});
		let descriptionTextBox = screen.getByRole("textbox", {
			name: /project description/i,
		});
		let budgetTextBox = screen.getByRole("spinbutton", {
			name: /project budget/i,
		});
		expect(nameTextBox).toHaveValue("Armstrong, Crona and Ziemann");

		fireEvent.focus(descriptionTextBox);
		fireEvent.change(descriptionTextBox, {
			target: { value: "Uusikuvaus 1" },
		});
		expect(descriptionTextBox).toHaveValue("Uusikuvaus 1");

		fireEvent.focus(budgetTextBox);
		fireEvent.change(budgetTextBox, {
			target: { value: "1000" },
		});

		expect(budgetTextBox).toHaveValue(1000);

		const submitButton = screen.getByRole("button", { name: /save/i });
		fireEvent.click(submitButton);

		const newTextElement = await screen.findByText(/uusikuvaus 1/i);

		expect(newTextElement).toBeInTheDocument();
	});

	// This is another integration test, to test getting more projects from database as we click the more button
	// ! Integration test
	test("should get more projects from database", async () => {
		setup();
		const moreButton = await screen.findByRole("button", {
			name: /more\.\.\./i,
		});
		//  screen.getByRole("button", {
		// 	name: /more/i,
		// });

		// while (
		// 	store.getState().projectState.projects.length < allProjects.length
		// ) {
		// 	console.log(allProjects.length);
		// 	console.log(store.getState().projectState.projects.length);
		// 	fireEvent.click(moreButton);
		// }

		fireEvent.click(moreButton);

		// Assume that all projects are loaded
		expect(store.getState().projectState.projects.length).toEqual(
			allProjects.length
		);
		const allProjectCards = screen.getAllByRole("img");
		expect(allProjectCards).toHaveLength(allProjects.length);

		expect(
			screen.queryByRole("button", { name: /more/i })
		).not.toBeInTheDocument();
	});

	// Integration test, to test clicking on one card and get routed to new page with the project info information
	// ! Integration test
	test("should navigate to new route with the right project", async () => {
		render(<App />);

		// Navigate to the project page
		const projectsLink = screen.getByRole("link", { name: /projects/i });
		fireEvent.click(projectsLink);

		// Get a random project from the list
		const randomProject =
			store.getState().projectState.projects[
				Math.floor(
					Math.random() *
						store.getState().projectState.projects.length
				)
			];

		const projectCardLink = screen.getByRole("link", {
			name: new RegExp("^" + randomProject.name, "i"),
		});

		// Check the chosen random project
		console.log(
			"🚀 ~ file: ProjectsPage-test.tsx ~ line 178 ~ test ~ randomProject",
			randomProject
		);
		// Check that the link is correct
		expect(projectCardLink).toHaveAttribute(
			"href",
			`/projects/${randomProject.id}`
		);

		fireEvent.click(projectCardLink);

		// Check that the new route is correct
		expect(window.location.pathname).toBe(`/projects/${randomProject.id}`);
		expect(
			await screen.findByRole("heading", { name: /project detail/i })
		).toBeInTheDocument();

		expect(await screen.findByText(randomProject.name)).toBeInTheDocument();

		// Debug the screen to see what elements there are
		// eslint-disable-next-line testing-library/no-debugging-utils
		screen.debug();

		// Check that the project description is correct
		expect(
			await screen.findByText(randomProject.description)
		).toBeInTheDocument();

		// Check that the image is correct
		expect(
			await screen.findByRole("img", {
				name: new RegExp(randomProject.name, "i"),
			})
		).toBeInTheDocument();
	});
});
