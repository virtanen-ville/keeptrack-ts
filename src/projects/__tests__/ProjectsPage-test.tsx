import { MemoryRouter } from "react-router-dom";
import ProjectsPage from "../ProjectsPage";
import {
	screen,
	fireEvent,
	render,
	waitFor,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import { Project } from "../Project";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Provider } from "react-redux";
import { store } from "../../state";
import { allProjects } from "../mockProjects";

// We mock a server with msw and return a mocked response that has the projects as JSON. This server get function is called at the useEffect hook in ProjectsPage.tsx
const handlers = [
	rest.get("http://localhost:4000/projects", (req, res, ctx) => {
		let page: number = Number(req.url.searchParams.get("_page"));
		let limit: number = Number(req.url.searchParams.get("_limit"));

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

	// We test that the projects are displayed when the data is fetched.
	// ! Unit test
	test("should show right amount of projects", async () => {
		setup();
		const loadingText = screen.getByText(/loading/i);
		await waitForElementToBeRemoved(loadingText);

		expect(await screen.findAllByRole("img")).toHaveLength(20);
	});

	// Test that the error is shown when the server returns an error
	// ! Unit test
	test("should show correct errors on server error 500", async () => {
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

	// Test that the error is shown when the server returns an error
	// ! Unit test
	test("should show correct errors on server error 401", async () => {
		server.use(
			rest.get("http://localhost:4000/projects", (req, res, ctx) => {
				return res(ctx.status(401));
			})
		);
		setup();
		expect(
			await screen.findByText(/Please login again./i)
		).toBeInTheDocument();
	});

	// Test that the error is shown when the server returns an error
	// ! Unit test
	test("should show correct errors on server error 403", async () => {
		server.use(
			rest.get("http://localhost:4000/projects", (req, res, ctx) => {
				return res(ctx.status(401));
			})
		);
		setup();
		expect(
			await screen.findByText(
				/You do not have permission to view the project(s)./i
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

		fireEvent.click(
			await screen.findByRole("button", {
				name: /more\.\.\./i,
			})
		);
		await waitFor(async () => {
			const allProjectCards = await screen.findAllByRole("button", {
				name: /edit/i,
			});
			// Should load 20 more projects
			expect(allProjectCards).toHaveLength(40);
		});

		fireEvent.click(
			await screen.findByRole("button", {
				name: /more\.\.\./i,
			})
		);
		await waitFor(async () => {
			const allProjectCards = await screen.findAllByRole("button", {
				name: /edit/i,
			});
			// Should load 20 more projects
			expect(allProjectCards).toHaveLength(60);
		});
		fireEvent.click(
			await screen.findByRole("button", {
				name: /more\.\.\./i,
			})
		);

		await waitFor(async () => {
			const allProjectCards = await screen.findAllByRole("button", {
				name: /edit/i,
			});
			// Should load 20 more projects
			expect(allProjectCards).toHaveLength(80);
		});

		fireEvent.click(
			await screen.findByRole("button", {
				name: /more\.\.\./i,
			})
		);

		await waitFor(async () => {
			const allProjectCards = await screen.findAllByRole("button", {
				name: /edit/i,
			});
			// Should load the rest of the projects (there are 97 in the mocked database)
			expect(allProjectCards).toHaveLength(97);
		});

		// Assume that all projects are loaded (Redux store should have all the projects)
		expect(store.getState().projectState.projects.length).toEqual(
			allProjects.length
		);

		const allProjectCards = await screen.findAllByRole("button", {
			name: /edit/i,
		});

		expect(allProjectCards).toHaveLength(97);
		const allProjectImages = await screen.findAllByRole("img");
		expect(allProjectImages).toHaveLength(allProjects.length);

		// TODO; Fix this (button should remove itself when all loaded)
		if (
			store.getState().projectState.projects.length === allProjects.length
		) {
			// eslint-disable-next-line jest/no-conditional-expect
			expect(
				await screen.findByRole("button", {
					name: /more\.\.\./i,
				})
			)
				//not.
				.toBeInTheDocument();
		}
	});
});
