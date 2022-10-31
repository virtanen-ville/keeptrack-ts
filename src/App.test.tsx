import App from "./App";
import { screen, fireEvent, render, waitFor } from "@testing-library/react";
import { Project } from "./projects/Project";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { store } from "./state";
import { allProjects } from "./projects/mockProjects";

// We mock a server with msw and return a mocked response that has the projects as JSON. This server get function is called at the useEffect hook in ProjectsPage.tsx
const handlers = [
	rest.get("http://localhost:4000/projects", (req, res, ctx) => {
		const projects = allProjects
			.sort((a: Project, b: Project) => a.name.localeCompare(b.name))
			.slice(0, 20);

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

// This block tests the App component (the main component).
describe("<App />", () => {
	// Test that the App loads without crashing.
	test("should load the main App without crashing", () => {
		render(<App />);
	});

	// Test that there are two navigation links that have the correct text (Home and Projects).
	test("should render navigation links Home and Projects", () => {
		render(<App />);

		// We could get the link by name too, but lets check for the text instead.
		//const homeLink = screen.getByRole("link", { name: /home/i });
		const links = screen.getAllByRole("link");

		// Check that there are two links.
		expect(links.length).toBe(2);

		// Check that the first link has the text "Home".
		expect(links[0]).toHaveTextContent(/home/i);

		// Check that the second link has the text "Projects".
		expect(links[1]).toHaveTextContent(/projects/i);
	});

	// Check that the Home component renders (That has a heading of text Home).
	test("should render Homepage with Home heading", () => {
		render(<App />);
		expect(screen.getByRole("heading")).toHaveTextContent("Home");
	});

	// Test that the logo file is rendered as image.
	test("should render an image with logo", () => {
		render(<App />);
		const image = screen.getByRole("img", { name: /logo/i });
		expect(image).toHaveAttribute("src", "/assets/logo-3.svg");
		expect(image).toBeInTheDocument();
	});
});

// ! Integration test
describe("<App Integration />", () => {
	// We start the server before the tests and close it after the tests. In between we can reset the handlers if we need to.
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	// Integration test, to test clicking on one card and get routed to new page with the project info information
	// ! Integration test
	test("should navigate to new route with the right project", async () => {
		//setup();
		render(<App />);

		// Navigate to the project page
		const projectsLink = screen.getByRole("link", { name: /projects/i });
		fireEvent.click(projectsLink);

		// Wait for the projects to load
		await waitFor(() => {
			const projectCards = screen.getAllByRole("img");
			expect(projectCards.length).toBe(21);
		});

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
		//screen.debug();

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
