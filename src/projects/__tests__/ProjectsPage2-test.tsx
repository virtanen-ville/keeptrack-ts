import React from "react";
import { MemoryRouter } from "react-router-dom";
//import { Provider } from "react-redux";
//import { store } from "../../state";
import ProjectsPage from "../ProjectsPage";
import {
	screen,
	waitForElementToBeRemoved,
	fireEvent,
} from "@testing-library/react";
import { renderWithProviders } from "../state/testUtils";
import { Project } from "../Project";
import userEvent from "@testing-library/user-event";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { mockProjects } from "../mockProjects";

// We mock a server with msw and return a mocked response taht has the projects as JSON. This server get function is called at the useEffect hook in ProjectsPage.tsx
const handlers = [
	rest.get("http://localhost:4000/projects", (req, res, ctx) => {
		return res(ctx.json(mockProjects));
	}),

	rest.put("http://localhost:4000/projects/*", (req, res, ctx) => {
		return res(ctx.json(req.body));
	}),
];

const server = setupServer(...handlers);

describe("<ProjectsPage />", () => {
	const setup = () => {
		renderWithProviders(
			<MemoryRouter>
				<ProjectsPage />
			</MemoryRouter>
		);
	};

	// We start the server before the tests and close it after the tests. In between we can reset the handlers if we need to.
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

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
	test("should show Projects title", async () => {
		setup();
		await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

		expect(screen.getByText("Projects")).toBeInTheDocument();
	});

	// We test that the projects are displayed when the data is fetched. This is already an integration test, but this component itself has pretty much nothing to test.
	// ! Integration test
	test("should show right amount of projects", async () => {
		setup();
		expect(await screen.findAllByRole("img")).toHaveLength(
			mockProjects.length
		);
	});

	// Test for showing more button
	// ! Unit test
	test("should show a 'more' button", async () => {
		setup();
		expect(
			await screen.findByRole("button", { name: /more/i })
		).toBeInTheDocument();
	});

	// Test the error message when the server returns an error
	// ! Integration test
	test("should show correct errors on server error", async () => {
		let testCases = [
			{ status: 401, message: "Please login again." },
			{
				status: 403,
				message: "You do not have permission to view the project(s).",
			},
			{
				status: 500,
				message:
					"There was an error retrieving the project(s). Please try again.",
			},
		];

		testCases.forEach(async (testCase) => {
			server.use(
				rest.get("http://localhost:4000/projects", (req, res, ctx) => {
					return res(ctx.status(testCase.status, testCase.message));
				})
			);
			setup();

			const regex = new RegExp(testCase.message, "i");
			expect(await screen.findByText(regex)).toBeInTheDocument();
		});
	});

	// This is pretty extensive integration test, to test changing information and getting it on screen
	// ! Integration test
	test("should open form and get input and change information", async () => {
		setup();

		let updatedProject = new Project({
			id: 1,
			name: "Uusinimi 1",
			description: "Uusikuvaus 1",
			budget: 1000,
		});

		const view = userEvent.setup();

		let nameTextBox1 = screen.queryByRole("textbox", {
			name: /project name/i,
		});
		expect(nameTextBox1).not.toBeInTheDocument();

		const editButton = await screen.findByRole("button", {
			name: /edit Testi Nimi 1/i,
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
		await view.clear(nameTextBox);
		await view.type(nameTextBox, updatedProject.name);
		expect(nameTextBox).toHaveValue(updatedProject.name);

		await view.clear(descriptionTextBox);
		await view.type(descriptionTextBox, updatedProject.description);
		expect(descriptionTextBox).toHaveValue(updatedProject.description);

		await view.clear(budgetTextBox);
		await view.type(budgetTextBox, updatedProject.budget.toString());
		expect(budgetTextBox).toHaveValue(updatedProject.budget);

		const submitButton = screen.getByRole("button", { name: /save/i });
		const cancelButton = screen.getByRole("button", { name: /cancel/i });

		await view.click(submitButton).then(() => {
			waitForElementToBeRemoved(() => screen.queryByRole("form")).then(
				() => {
					console.log("form removed");
				}
			);
		});
		await view.click(cancelButton).then(() => {
			// eslint-disable-next-line testing-library/no-debugging-utils
			//screen.debug();
			expect(screen.queryByRole("form")).not.toBeInTheDocument();
			expect(
				screen.getByRole("img", { name: /uusinimi 1/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: /uusinimi 1/i })
			).toBeInTheDocument();
		});
	});
});
