import configureMockStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";
import { initialAppState } from "../../../state";
import { loadProjects, saveProject } from "../projectActions";
import {
	LOAD_PROJECTS_REQUEST,
	LOAD_PROJECTS_SUCCESS,
	LOAD_PROJECTS_FAILURE,
	SAVE_PROJECT_REQUEST,
	SAVE_PROJECT_SUCCESS,
} from "../projectTypes";
import { projectAPI } from "../../projectAPI";
import { mockProjects, mockProject } from "../../mockProjects";
jest.mock("../../projectAPI");

const middlewares = [ReduxThunk];
const mockStoreCreator = configureMockStore(middlewares);

describe("Project Actions", () => {
	let store: any;

	beforeEach(() => {
		store = mockStoreCreator(initialAppState);
	});

	test("should load projects successfully", () => {
		const expectedActions = [
			{ type: LOAD_PROJECTS_REQUEST },
			{
				type: LOAD_PROJECTS_SUCCESS,
				payload: { projects: mockProjects, page: 1 },
			},
		];

		return store.dispatch(loadProjects(1)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual(expectedActions);
		});
	});

	test("should save a project succesfully", () => {
		const expectedActions = [
			{ type: SAVE_PROJECT_REQUEST },
			{
				type: SAVE_PROJECT_SUCCESS,
				payload: mockProject,
			},
		];

		return store.dispatch(saveProject(mockProject)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual(expectedActions);
		});
	});

	test("should return error", () => {
		projectAPI.get = jest.fn().mockImplementationOnce(() => {
			return Promise.reject("failed");
		});

		const expectedActions = [
			{ type: LOAD_PROJECTS_REQUEST },
			{
				type: LOAD_PROJECTS_FAILURE,
				payload: "failed",
			},
		];

		return store.dispatch(loadProjects(1)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual(expectedActions);
		});
	});
});
